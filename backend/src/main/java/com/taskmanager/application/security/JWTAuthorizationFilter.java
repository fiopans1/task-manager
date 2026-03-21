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

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        logger.debug("Processing JWT authorization for request: {}", request.getRequestURI());

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            logger.debug("No valid Authorization header found, continuing without authentication");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);
        logger.debug("JWT token found, attempting to validate");

        try {
            JWTClaimsSet claims = jwtUtilityService.parseJWT(token);
            String username = claims.getSubject();
            logger.debug("JWT validated successfully for user: {}", username);

            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            logger.debug("Authentication set successfully for user: {}", username);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException | IOException | JOSEException
                | ParseException e) {
            logger.warn("JWT validation failed: {}", e.getMessage());
            throw new RuntimeException(e);
        }
        filterChain.doFilter(request, response);
    }

}
