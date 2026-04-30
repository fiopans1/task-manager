package com.taskmanager.application.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import com.taskmanager.application.service.CustomUserDetailsService;
import com.taskmanager.application.service.JWTUtilityService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.text.ParseException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JWTAuthorizationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JWTAuthorizationFilter.class);

    @Autowired
    private JWTUtilityService jwtUtilityService;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private SessionCookieService sessionCookieService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        logger.debug("Processing JWT authorization for request: {}", request.getRequestURI());

        String token = resolveToken(request);
        if (token == null) {
            logger.debug("No valid Authorization header found, continuing without authentication");
            filterChain.doFilter(request, response);
            return;
        }
        logger.debug("JWT token found, attempting to validate");

        try {
            JWTClaimsSet claims = jwtUtilityService.parseJWT(token);
            String username = claims.getSubject();
            logger.debug("JWT validated successfully for user: {}", username);

            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

            // Reject blocked users — their token is still valid but account is locked
            if (!userDetails.isAccountNonLocked()) {
                logger.warn("Blocked user attempted access: {}", username);
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Your account has been blocked. Contact an administrator.\"}");
                return;
            }

            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            logger.debug("Authentication set successfully for user: {}", username);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException | IOException | JOSEException
                | ParseException e) {
            logger.warn("JWT validation failed: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        return sessionCookieService.resolveToken(request)
                .orElseGet(() -> {
                    String authorizationHeader = request.getHeader("Authorization");
                    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                        return authorizationHeader.substring(7);
                    }
                    return null;
                });
    }

}
