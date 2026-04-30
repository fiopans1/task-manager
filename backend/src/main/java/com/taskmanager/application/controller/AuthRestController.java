package com.taskmanager.application.controller;

import com.taskmanager.application.model.dto.LoginDTO;
import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.dto.SessionInfoDTO;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.security.SessionCookieService;
import com.taskmanager.application.service.AuthService;
import com.taskmanager.application.service.JWTUtilityService;

import java.util.Date;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/auth")
public class AuthRestController {

    private static final Logger logger = LoggerFactory.getLogger(AuthRestController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private JWTUtilityService jwtUtilityService;

    @Autowired
    private SessionCookieService sessionCookieService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO login, HttpServletResponse response) throws Exception {
        logger.info("Login attempt for user: {}", login.getUsername());

        try {
            User user = authService.login(login);
            String token = jwtUtilityService.generateJWT(user);
            Date expirationTime = jwtUtilityService.parseJWT(token).getExpirationTime();
            sessionCookieService.addSessionCookie(response, token, jwtUtilityService.getSessionDurationSeconds());
            SessionInfoDTO sessionInfo = authService.buildSessionInfo(user, expirationTime);
            logger.info("Login successful for user: {}", login.getUsername());
            return ResponseEntity.ok(sessionInfo);
        } catch (BadCredentialsException e) {
            logger.warn("Login failed for user: {}", login.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse(e.getMessage()));
        } catch (LockedException e) {
            logger.warn("Blocked user attempted login: {}", login.getUsername());
            return ResponseEntity.status(HttpStatus.LOCKED).body(errorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Login error for user: {}", login.getUsername(), e);
            throw e;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        sessionCookieService.clearSessionCookie(response);
        return ResponseEntity.noContent().build();
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

    private HashMap<String, String> errorResponse(String message) {
        HashMap<String, String> response = new HashMap<>();
        response.put("error", message);
        return response;
    }

}
