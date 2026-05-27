package com.taskmanager.application.security;

import com.nimbusds.jwt.JWTClaimsSet;
import com.taskmanager.application.model.entities.AuthSession;
import com.taskmanager.application.service.CustomUserDetailsService;
import com.taskmanager.application.service.JWTUtilityService;
import com.taskmanager.application.service.SessionService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Optional;

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

    private static final List<String> PUBLIC_PATH_PREFIXES = List.of(
            "/auth/",
            "/oauth2/",
            "/api/session/me",
            "/api/session/csrf",
            "/api/session/refresh",
            "/api/session/logout",
            "/api/config",
            "/health",
            "/error"
    );

    @Autowired
    private JWTUtilityService jwtUtilityService;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private SessionCookieService sessionCookieService;

    @Autowired
    private SessionService sessionService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        logger.debug("JWT filter: {} {}", request.getMethod(), request.getRequestURI());

        Optional<String> accessToken = sessionCookieService.getAccessToken(request);

        if (accessToken.isEmpty()) {
            logger.debug("JWT filter: no access token cookie, continuing unauthenticated");
            filterChain.doFilter(request, response);
            return;
        }

        logger.debug("JWT filter: access token cookie found, validating...");

        try {
            JWTClaimsSet claims = jwtUtilityService.parseJWT(accessToken.get());
            String username = claims.getSubject();
            String sid = (String) claims.getClaim("sid");
            logger.debug("JWT filter: token valid for user={}, sid={}", username, sid);

            AuthSession session = sessionService.getSessionByIdentifier(sid);
            if (session == null) {
                logger.warn("JWT filter: session {} not found in DB", sid);
                setResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Session is no longer valid");
                return;
            }
            if (!session.isActive(new Date())) {
                logger.warn("JWT filter: session {} inactive (expired or revoked)", sid);
                setResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Session is no longer valid");
                return;
            }

            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

            if (!userDetails.isAccountNonLocked()) {
                logger.warn("JWT filter: blocked user {}", username);
                setResponse(response, HttpServletResponse.SC_FORBIDDEN, "Your account has been blocked. Contact an administrator.");
                return;
            }

            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            logger.debug("JWT filter: authentication set for {}", username);
        } catch (Exception e) {
            if (isPublicRequest(request)) {
                logger.debug("JWT filter: ignoring invalid access token on public endpoint {}: {}",
                        request.getRequestURI(), e.getMessage());
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }

            logger.error("JWT filter: validation failed - {}", e.getMessage(), e);
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request, response);
    }

    private boolean isPublicRequest(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri == null) {
            return false;
        }

        return PUBLIC_PATH_PREFIXES.stream().anyMatch(uri::startsWith);
    }

    private void setResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }

}
