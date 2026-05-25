package com.taskmanager.application.controller;

import com.taskmanager.application.model.dto.SessionDTO;
import com.taskmanager.application.model.entities.AuthSession;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.security.SessionCookieService;
import com.taskmanager.application.service.AuthService;
import com.taskmanager.application.service.CsrfService;
import com.taskmanager.application.service.JWTUtilityService;
import com.taskmanager.application.service.SessionService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Date;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
    private SessionService sessionService;

    @Autowired
    private JWTUtilityService jwtUtilityService;

    @Autowired
    private SessionCookieService sessionCookieService;

    @Autowired
    private CsrfService csrfService;

    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf(HttpServletRequest request, HttpServletResponse response) {
        csrfService.ensureToken(request, response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<SessionDTO> getCurrentSession(HttpServletRequest request) {
        boolean hasRefreshToken = sessionCookieService.getRefreshToken(request).isPresent();
        Optional<String> accessToken = sessionCookieService.getAccessToken(request);
        if (accessToken.isEmpty()) {
            return unauthenticatedOrRefreshRequired(hasRefreshToken);
        }

        try {
            var claims = jwtUtilityService.parseJWT(accessToken.get());
            String username = claims.getSubject();
            String sid = (String) claims.getClaim("sid");
            Date expiresAt = claims.getExpirationTime();

            User user = authService.getCurrentUser();
            if (user == null || !user.getUsername().equals(username)) {
                return unauthenticatedOrRefreshRequired(hasRefreshToken);
            }

            if (user.isBlocked()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            AuthSession session = sessionService.getSessionByIdentifier(sid);
            if (session == null || !session.isActive(new Date())) {
                return unauthenticatedOrRefreshRequired(hasRefreshToken);
            }

            return ResponseEntity.ok(sessionService.buildCurrentSession(user, session, expiresAt));
        } catch (Exception e) {
            logger.debug("Could not validate access token: {}", e.getMessage());
            return unauthenticatedOrRefreshRequired(hasRefreshToken);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<SessionDTO> refresh(HttpServletRequest request, HttpServletResponse response) {
        try {
            SessionDTO session = sessionService.refreshSession(request, response);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            logger.warn("Refresh token failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        sessionService.logout(request, response);
        csrfService.rotateToken(request, response);
        return ResponseEntity.ok().build();
    }

    private ResponseEntity<SessionDTO> unauthenticatedOrRefreshRequired(boolean hasRefreshToken) {
        if (hasRefreshToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        SessionDTO session = new SessionDTO();
        session.setAuthenticated(false);
        return ResponseEntity.ok(session);
    }

}
