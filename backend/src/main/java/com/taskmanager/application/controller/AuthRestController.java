package com.taskmanager.application.controller;

import com.taskmanager.application.model.dto.LoginDTO;
import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.security.OAuth2LoginFailureHandler;
import com.taskmanager.application.service.AuthService;

import java.util.HashMap;

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

    @PostMapping("/login")
    public ResponseEntity<HashMap<String, String>> login(@RequestBody LoginDTO login) throws Exception {
        logger.info("Login attempt for user: {}", login.getUsername());

        try {
            HashMap<String, String> response = authService.login(login);
            if (response.get("token") == null) {
                logger.warn("Login failed for user: {} - {}", login.getUsername(), response.get("error"));
                return ResponseEntity.badRequest().body(response);
            } else {
                logger.info("Login successful for user: {}", login.getUsername());
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            logger.error("Login error for user: {}", login.getUsername(), e);
            throw e;
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ResponseDTO> register(@RequestBody User user) throws Exception { //TO-DO: Change ResponseDTO to difference between error and success
        logger.info("Registration attempt for user: {}", user.getUsername());

        try {
            ResponseDTO response = authService.register(user);
            if (response.getErrorCount() <= 0) {
                logger.info("Registration successful for user: {}", user.getUsername());
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Registration failed for user: {} - {} errors", user.getUsername(), response.getErrorCount());
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            logger.error("Registration error for user: {}", user.getUsername(), e);
            throw e;
        }
    }

}
