package com.taskmanager.application.controller;

import com.taskmanager.application.service.AuthService;
import com.taskmanager.application.service.JWTUtilityService;
import com.taskmanager.application.model.entities.User;

import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/session")
public class SessionRestController {

    private static final Logger logger = LoggerFactory.getLogger(SessionRestController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private JWTUtilityService jwtUtilityService;

    @PostMapping("/refresh")
    public ResponseEntity<HashMap<String, String>> refreshToken() {
        logger.info("Token refresh requested");

        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser == null) {
                logger.warn("Token refresh failed: No authenticated user found");
                HashMap<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "No authenticated user found");
                return ResponseEntity.status(401).body(errorResponse);
            }

            String newToken = jwtUtilityService.generateJWT(currentUser);
            logger.info("Token refreshed successfully for user: {}", currentUser.getUsername());

            HashMap<String, String> response = new HashMap<>();
            response.put("token", newToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error refreshing token: {}", e.getMessage(), e);
            HashMap<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error refreshing token");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
