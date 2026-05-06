package com.taskmanager.application.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.respository.UserRepository;
import com.taskmanager.application.service.CsrfService;
import com.taskmanager.application.service.SessionService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private CsrfService csrfService;

    @Value("${taskmanager.oauth2.authorized-redirect-uris}")
    private String authorizedRedirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            logger.info("Processing successful OAuth2 login for user: {} (ID: {})",
                    userPrincipal.getUsername(), userPrincipal.getId());

            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new Exception("User not found: " + userPrincipal.getId()));

            sessionService.createSessionForUser(user, request, response);
            csrfService.rotateToken(request, response);

            logger.info("Redirecting OAuth2 login to: {}", authorizedRedirectUri);
            response.sendRedirect(authorizedRedirectUri);

        } catch (Exception e) {
            logger.error("Error during OAuth2 session creation", e);
            handleAuthenticationError(response, e);
        }
    }

    private void handleAuthenticationError(HttpServletResponse response, Exception e) throws IOException {
        logger.error("Error in OAuth2 token generation: {}", e.getMessage());

        String errorUrl = authorizedRedirectUri + "?error=token_generation_failed&message="
                + java.net.URLEncoder.encode(e.getMessage(), "UTF-8");

        response.sendRedirect(errorUrl);
    }
}
