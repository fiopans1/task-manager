package com.taskmanager.application.controller;

import com.taskmanager.application.model.dto.LoginDTO;
import com.taskmanager.application.model.dto.RegisterDTO;
import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.dto.SessionDTO;
import com.taskmanager.application.service.AuthService;
import com.taskmanager.application.service.CsrfService;
import com.taskmanager.application.service.SessionService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthRestController {

    private static final Logger logger = LoggerFactory.getLogger(AuthRestController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private CsrfService csrfService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO login, HttpServletRequest request, HttpServletResponse response) throws Exception {
        logger.info("Login attempt for user: {}", login.getUsername());

        try {
            SessionDTO session = sessionService.login(login, request, response);
            csrfService.rotateToken(request, response);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            logger.warn("Login failed for user {}: {}", login.getUsername(), e.getMessage());
            java.util.HashMap<String, String> errorBody = new java.util.HashMap<>();
            errorBody.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorBody);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ResponseDTO> register(@Valid @RequestBody RegisterDTO registerDTO) throws Exception {
        logger.info("Registration attempt for user: {}", registerDTO.getUsername());

        try {
            ResponseDTO response = authService.register(registerDTO);
            if (response.getErrorCount() <= 0) {
                logger.info("Registration successful for user: {}", registerDTO.getUsername());
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Registration failed for user: {} - {} errors", registerDTO.getUsername(), response.getErrorCount());
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            logger.error("Registration error for user: {}", registerDTO.getUsername(), e);
            throw e;
        }
    }

}
