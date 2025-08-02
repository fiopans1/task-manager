package com.taskmanager.application.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2LoginFailureHandler.class);

    @Value("${taskmanager.oauth2.authorized-redirect-uris}")
    private String defaultFailureUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {

        logger.error("OAuth2 authentication failed", exception);

        String errorMessage = "Authentication failed";
        String errorCode = "oauth2_error";

        // Manejar diferentes tipos de errores OAuth2
        if (exception instanceof OAuth2AuthenticationException) {
            OAuth2AuthenticationException oauth2Exception = (OAuth2AuthenticationException) exception;
            OAuth2Error error = oauth2Exception.getError();

            errorCode = error.getErrorCode();
            errorMessage = error.getDescription();

            logger.error("OAuth2 Error Code: {}, Description: {}", errorCode, errorMessage);

            // Personalizar mensajes según el tipo de error
            switch (errorCode) {
                case "access_denied":
                    errorMessage = "User cancelled authorization";
                    break;
                case "invalid_request":
                    errorMessage = "Invalid OAuth2 request";
                    break;
                case "unauthorized_client":
                    errorMessage = "Unauthorized client";
                    break;
                case "unsupported_response_type":
                    errorMessage = "Unsupported response type";
                    break;
                case "invalid_scope":
                    errorMessage = "Invalid scope";
                    break;
                case "server_error":
                    errorMessage = "Authorization server error";
                    break;
                case "temporarily_unavailable":
                    errorMessage = "Service temporarily unavailable";
                    break;
                default:
                    errorMessage = "OAuth2 authentication error";
                    break;
            }
        }else{
            errorMessage = exception.getMessage() != null ? exception.getMessage() : errorMessage;
        }
        

        // Agregar información adicional al log
        logger.info("Failed OAuth2 login attempt from IP: {}, User-Agent: {}",
                getClientIpAddress(request),
                request.getHeader("User-Agent"));
        // Construir URL de redirección con parámetros de error
        String redirectUrl = buildRedirectUrl(errorCode, errorMessage);

        // Limpiar la sesión si existe
        if (request.getSession(false) != null) {
            request.getSession().invalidate();
        }

        // Redirigir al usuario
        response.sendRedirect(redirectUrl);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    private String buildRedirectUrl(String errorCode, String errorMessage) {
        try {
            String encodedMessage = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8.toString());
            return String.format("%s?code=%s&message=%s", defaultFailureUrl, errorCode, encodedMessage);
        } catch (Exception e) {
            logger.error("Error encoding failure URL parameters", e);
            return "";
        }
    }
    
    // Getter y setter para configurar la URL de fallo
    public String getDefaultFailureUrl() {
        return defaultFailureUrl;
    }


}
