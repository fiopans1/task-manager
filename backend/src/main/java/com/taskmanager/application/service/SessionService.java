package com.taskmanager.application.service;

import com.taskmanager.application.config.TaskManagerSecurityProperties;
import com.taskmanager.application.model.dto.SessionDTO;
import com.taskmanager.application.model.dto.UserDTO;
import com.taskmanager.application.model.entities.AuthSession;
import com.taskmanager.application.model.entities.RefreshToken;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.dto.LoginDTO;
import com.taskmanager.application.respository.AuthSessionRepository;
import com.taskmanager.application.respository.RefreshTokenRepository;
import com.taskmanager.application.security.SessionCookieService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class SessionService {

    private static final Logger logger = LoggerFactory.getLogger(SessionService.class);

    @Autowired
    private AuthService authService;
    
    @Autowired
    private AuthSessionRepository authSessionRepository;
    
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    
    @Autowired
    private JWTUtilityService jwtUtilityService;
    
    @Autowired
    private SessionCookieService sessionCookieService;
    
    @Autowired
    private TaskManagerSecurityProperties securityProperties;

    @Transactional
    public SessionDTO login(LoginDTO login, HttpServletRequest request, HttpServletResponse response) throws Exception {
        User user = authService.authenticate(login);
        return createSessionForUser(user, request, response);
    }

    @Transactional
    public SessionDTO createSessionForUser(User user, HttpServletRequest request, HttpServletResponse response) {
        Date now = new Date();
        AuthSession session = new AuthSession();
        session.setSessionIdentifier(UUID.randomUUID().toString());
        session.setUser(user);
        session.setIpAddress(resolveClientIp(request));
        session.setUserAgent(resolveUserAgent(request));
        session.setCreatedAt(now);
        session.setLastUsedAt(now);
        session.setExpiresAt(new Date(now.getTime() + securityProperties.getRefreshToken().getTtl().toMillis()));
        AuthSession savedSession = authSessionRepository.save(session);

        IssuedToken issued = issueRefreshToken(savedSession, null, now);
        TokenBundle tokenBundle = issueTokenBundle(user, savedSession, issued.entity(), issued.secret(), now);
        sessionCookieService.addAuthenticationCookies(response, tokenBundle.accessToken(), tokenBundle.refreshToken());

        logger.info("Created authenticated session {} for user {}", savedSession.getSessionIdentifier(), user.getUsername());
        return buildSessionDto(user, savedSession, tokenBundle.accessExpiresAt());
    }

    @Transactional(readOnly = true)
    public AuthSession getSessionByIdentifier(String sessionIdentifier) {
        return authSessionRepository.findBySessionIdentifier(sessionIdentifier).orElse(null);
    }

    @Transactional
    public SessionDTO refreshSession(HttpServletRequest request, HttpServletResponse response) {
        Date now = new Date();
        String rawRefreshToken = sessionCookieService.getRefreshToken(request)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Refresh token not found"));

        ParsedRefreshToken parsedRefreshToken = parseRefreshToken(rawRefreshToken);
        RefreshToken storedToken = refreshTokenRepository.findByTokenIdentifier(parsedRefreshToken.tokenIdentifier())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid refresh token"));

        if (!constantTimeEquals(storedToken.getTokenHash(), hashTokenSecret(parsedRefreshToken.secret()))) {
            revokeSession(storedToken.getSession(), "INVALID_REFRESH_TOKEN_HASH");
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid refresh token");
        }

        if (storedToken.getUsedAt() != null || StringUtils.hasText(storedToken.getReplacedByTokenIdentifier())) {
            revokeSession(storedToken.getSession(), "REFRESH_TOKEN_REUSE_DETECTED");
            throw new ResponseStatusException(UNAUTHORIZED, "Refresh token reuse detected");
        }

        if (!storedToken.isActive(now)) {
            revokeSession(storedToken.getSession(), "REFRESH_TOKEN_EXPIRED_OR_REVOKED");
            throw new ResponseStatusException(UNAUTHORIZED, "Refresh token is no longer valid");
        }

        AuthSession session = storedToken.getSession();
        if (!session.isActive(now)) {
            revokeSession(session, "SESSION_EXPIRED_OR_REVOKED");
            throw new ResponseStatusException(UNAUTHORIZED, "Session is no longer valid");
        }

        User user = session.getUser();
        if (user.isBlocked()) {
            revokeSession(session, "USER_BLOCKED");
            throw new ResponseStatusException(FORBIDDEN, "Your account has been blocked. Contact an administrator.");
        }

        storedToken.setUsedAt(now);

        IssuedToken rotated = issueRefreshToken(session, storedToken.getTokenIdentifier(), now);
        storedToken.setReplacedByTokenIdentifier(rotated.entity().getTokenIdentifier());

        session.setLastUsedAt(now);
        session.setExpiresAt(new Date(now.getTime() + securityProperties.getRefreshToken().getTtl().toMillis()));

        TokenBundle tokenBundle = issueTokenBundle(user, session, rotated.entity(), rotated.secret(), now);
        sessionCookieService.addAuthenticationCookies(response, tokenBundle.accessToken(), tokenBundle.refreshToken());

        logger.info("Rotated refresh token for session {}", session.getSessionIdentifier());
        return buildSessionDto(user, session, tokenBundle.accessExpiresAt());
    }

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        AuthSession session = resolveSessionFromRequest(request);
        if (session != null) {
            revokeSession(session, "USER_LOGOUT");
        }
        sessionCookieService.clearAuthenticationCookies(response);
    }

    @Transactional
    public void revokeSession(AuthSession session, String reason) {
        if (session == null || session.getRevokedAt() != null) {
            return;
        }

        Date revokedAt = new Date();
        session.setRevokedAt(revokedAt);
        session.setRevokeReason(reason);
        authSessionRepository.save(session);

        List<RefreshToken> refreshTokens = refreshTokenRepository.findBySession(session);
        for (RefreshToken refreshToken : refreshTokens) {
            if (refreshToken.getRevokedAt() == null) {
                refreshToken.setRevokedAt(revokedAt);
                refreshToken.setRevokeReason(reason);
            }
        }
        refreshTokenRepository.saveAll(refreshTokens);
        logger.info("Revoked session {} - reason: {}", session.getSessionIdentifier(), reason);
    }

    public SessionDTO buildCurrentSession(User user, AuthSession session, Date accessExpiresAt) {
        return buildSessionDto(user, session, accessExpiresAt);
    }

    private SessionDTO buildSessionDto(User user, AuthSession session, Date accessExpiresAt) {
        SessionDTO sessionDTO = new SessionDTO();
        sessionDTO.setAuthenticated(true);
        sessionDTO.setSessionId(session.getSessionIdentifier());
        sessionDTO.setAccessExpiresAt(accessExpiresAt);
        sessionDTO.setUser(UserDTO.fromUser(user));
        sessionDTO.setRoles(user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .sorted()
                .toList());
        return sessionDTO;
    }

    private AuthSession resolveSessionFromRequest(HttpServletRequest request) {
        String rawRefreshToken = sessionCookieService.getRefreshToken(request).orElse(null);
        if (StringUtils.hasText(rawRefreshToken)) {
            try {
                ParsedRefreshToken parsedRefreshToken = parseRefreshToken(rawRefreshToken);
                RefreshToken refreshToken = refreshTokenRepository.findByTokenIdentifier(parsedRefreshToken.tokenIdentifier())
                        .orElse(null);
                if (refreshToken != null && constantTimeEquals(refreshToken.getTokenHash(), hashTokenSecret(parsedRefreshToken.secret()))) {
                    return refreshToken.getSession();
                }
            } catch (ResponseStatusException ex) {
                logger.debug("Ignoring invalid refresh token during logout: {}", ex.getReason());
            }
        }

        return sessionCookieService.getAccessToken(request)
                .flatMap(accessToken -> jwtUtilityService.extractSessionIdentifier(accessToken)
                .flatMap(authSessionRepository::findBySessionIdentifier))
                .orElse(null);
    }

    private IssuedToken issueRefreshToken(AuthSession session, String parentTokenIdentifier, Date now) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setSession(session);
        refreshToken.setTokenIdentifier(UUID.randomUUID().toString());
        refreshToken.setCreatedAt(now);
        refreshToken.setExpiresAt(new Date(now.getTime() + securityProperties.getRefreshToken().getTtl().toMillis()));
        refreshToken.setParentTokenIdentifier(parentTokenIdentifier);

        String secret = generateTokenSecret();
        refreshToken.setTokenHash(hashTokenSecret(secret));
        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
        return new IssuedToken(savedToken, secret);
    }

    private TokenBundle issueTokenBundle(User user, AuthSession session, RefreshToken refreshToken, String rawSecret, Date now) {
        Date accessExpiresAt = new Date(now.getTime() + securityProperties.getAccessToken().getTtl().toMillis());
        String accessToken = jwtUtilityService.generateAccessToken(user, session.getSessionIdentifier(), now, accessExpiresAt);
        String refreshTokenValue = refreshToken.getTokenIdentifier() + "." + rawSecret;
        return new TokenBundle(accessToken, accessExpiresAt, refreshTokenValue);
    }

    private ParsedRefreshToken parseRefreshToken(String rawRefreshToken) {
        String[] parts = rawRefreshToken.split("\\.", 2);
        if (parts.length != 2 || !StringUtils.hasText(parts[0]) || !StringUtils.hasText(parts[1])) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid refresh token");
        }
        return new ParsedRefreshToken(parts[0], parts[1]);
    }

    private String generateTokenSecret() {
        byte[] buffer = new byte[32];
        new java.security.SecureRandom().nextBytes(buffer);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buffer);
    }

    private String hashTokenSecret(String secret) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(secret.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    private boolean constantTimeEquals(String left, String right) {
        return MessageDigest.isEqual(left.getBytes(StandardCharsets.UTF_8), right.getBytes(StandardCharsets.UTF_8));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(xRealIp)) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    private String resolveUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return StringUtils.hasText(userAgent) ? userAgent : "Unknown";
    }

    private record ParsedRefreshToken(String tokenIdentifier, String secret) {

    }

    private record IssuedToken(RefreshToken entity, String secret) {

    }

    private record TokenBundle(String accessToken, Date accessExpiresAt, String refreshToken) {

    }
}
