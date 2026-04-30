package com.taskmanager.application.controller;

import com.nimbusds.jwt.JWTClaimsSet;
import com.taskmanager.application.model.dto.SessionInfoDTO;
import com.taskmanager.application.service.AuthService;
import com.taskmanager.application.service.JWTUtilityService;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.security.SessionCookieService;

import java.util.HashMap;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/session")
public class SessionRestController {

    private static final Logger logger = LoggerFactory.getLogger(SessionRestController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private JWTUtilityService jwtUtilityService;

    @Autowired
    private SessionCookieService sessionCookieService;

    @GetMapping
    public ResponseEntity<?> getSession(HttpServletRequest request) {
        logger.debug("Session requested");

        try {
            User currentUser = authService.getCurrentUser();
            Optional<String> token = sessionCookieService.resolveToken(request);
            if (currentUser == null || token.isEmpty()) {
                return ResponseEntity.status(401).body(errorResponse("No authenticated user found"));
            }

            JWTClaimsSet claimsSet = jwtUtilityService.parseJWT(token.get());
            SessionInfoDTO sessionInfo = authService.buildSessionInfo(currentUser, claimsSet.getExpirationTime());
            return ResponseEntity.ok(sessionInfo);
        } catch (Exception e) {
            logger.error("Error loading session: {}", e.getMessage(), e);
            return ResponseEntity.status(401).body(errorResponse("Invalid session"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletResponse response) {
        logger.info("Token refresh requested");

        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser == null) {
                logger.warn("Token refresh failed: No authenticated user found");
                return ResponseEntity.status(401).body(errorResponse("No authenticated user found"));
            }

            String newToken = jwtUtilityService.generateJWT(currentUser);
            JWTClaimsSet claimsSet = jwtUtilityService.parseJWT(newToken);
            sessionCookieService.addSessionCookie(response, newToken, jwtUtilityService.getSessionDurationSeconds());
            logger.info("Token refreshed successfully for user: {}", currentUser.getUsername());

            SessionInfoDTO sessionInfo = authService.buildSessionInfo(currentUser, claimsSet.getExpirationTime());
            return ResponseEntity.ok(sessionInfo);
        } catch (Exception e) {
            logger.error("Error refreshing token: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(errorResponse("Error refreshing token"));
        }
    }

    private HashMap<String, String> errorResponse(String message) {
        HashMap<String, String> response = new HashMap<>();
        response.put("error", message);
        return response;
    }
}
