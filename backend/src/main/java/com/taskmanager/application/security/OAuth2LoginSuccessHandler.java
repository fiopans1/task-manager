package com.taskmanager.application.security;

import java.io.IOException;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.respository.UserRepository;
import com.taskmanager.application.service.JWTUtilityService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTUtilityService jwtUtilityService;

    @Autowired
    private SessionCookieService sessionCookieService;

    @Value("${taskmanager.oauth2.authorized-redirect-uris}")
    private String authorizedRedirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        try {
            // At this point, the user was already processed and saved by CustomOAuth2UserService
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            logger.info("Processing successful OAuth2 login for user: {} (ID: {})",
                    userPrincipal.getEmail(), userPrincipal.getId());

            // Create User object for JWT
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new Exception("User not found: " + userPrincipal.getId()));

            String token = jwtUtilityService.generateJWT(user);
            Date expirationTime = jwtUtilityService.parseJWT(token).getExpirationTime();
            sessionCookieService.addSessionCookie(response, token, jwtUtilityService.getSessionDurationSeconds());

            String redirectUrl = buildRedirectUrl();

            logger.info("Redirecting to: {} with session expiring at {}", redirectUrl, expirationTime);
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            logger.error("Error during JWT token generation", e);
            handleAuthenticationError(response, e);
        }
    }

    private String buildRedirectUrl() {
        return authorizedRedirectUri;
    }

    /**
     * Handles errors during token generation
     */
    private void handleAuthenticationError(HttpServletResponse response, Exception e) throws IOException {
        logger.error("Error in token generation: {}", e.getMessage());

        // Redirect to frontend with error information
        String errorUrl = authorizedRedirectUri + "?code=token_generation_failed&message="
                + java.net.URLEncoder.encode(e.getMessage(), "UTF-8");

        response.sendRedirect(errorUrl);
    }
}
