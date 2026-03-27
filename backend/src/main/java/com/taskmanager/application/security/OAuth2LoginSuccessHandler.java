package com.taskmanager.application.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.taskmanager.application.model.entities.FullName;
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

            // Generate JWT token
            String token = jwtUtilityService.generateJWT(user);

            // Redirect to frontend with token
            String redirectUrl = buildRedirectUrl(token);

            logger.info("Redirecting to: {}", redirectUrl);
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            logger.error("Error durante la generación del token JWT", e);
            handleAuthenticationError(response, e);
        }
    }

    /**
     * Crea un objeto User a partir del UserPrincipal para generar el JWT
     */
    private User createUserFromPrincipal(UserPrincipal userPrincipal) {
        User user = new User();
        user.setId(userPrincipal.getId());
        user.setEmail(userPrincipal.getEmail());
        user.setUsername(userPrincipal.getUsername());
        user.setName(new FullName(userPrincipal.getName(), "", ""));
        user.setAuthoritiesAsRoles(userPrincipal.getAuthorities());
        return user;
    }

    /**
     * Construye la URL de redirección con el token
     */
    private String buildRedirectUrl(String token) {
        return authorizedRedirectUri + "?token=" + token;
    }

    /**
     * Handles errors during token generation
     */
    private void handleAuthenticationError(HttpServletResponse response, Exception e) throws IOException {
        logger.error("Error in token generation: {}", e.getMessage());

        // Redirect to frontend with error information
        String errorUrl = authorizedRedirectUri + "?error=token_generation_failed&message="
                + java.net.URLEncoder.encode(e.getMessage(), "UTF-8");

        response.sendRedirect(errorUrl);
    }
}
