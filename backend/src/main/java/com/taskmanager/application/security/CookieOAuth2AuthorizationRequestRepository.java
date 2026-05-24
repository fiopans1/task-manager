package com.taskmanager.application.security;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.application.config.TaskManagerSecurityProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.WebUtils;

@Component
public class CookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final Logger logger = LoggerFactory.getLogger(CookieOAuth2AuthorizationRequestRepository.class);

    private static final String AUTHORIZATION_REQUEST_COOKIE_NAME = "TM-OAUTH2-REQUEST";

    private static final String OAUTH2_COOKIE_PATH = "/oauth2";

    private static final long COOKIE_MAX_AGE_SECONDS = 180;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TaskManagerSecurityProperties securityProperties;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return getCookieValue(request, AUTHORIZATION_REQUEST_COOKIE_NAME)
                .map(this::deserialize)
                .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
            HttpServletRequest request,
            HttpServletResponse response) {
        if (authorizationRequest == null) {
            clearAuthorizationRequestCookie(response);
            return;
        }

        String serializedRequest = serialize(authorizationRequest);
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(
                AUTHORIZATION_REQUEST_COOKIE_NAME,
                serializedRequest,
                COOKIE_MAX_AGE_SECONDS
        ).toString());
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
            HttpServletResponse response) {
        OAuth2AuthorizationRequest authorizationRequest = loadAuthorizationRequest(request);
        clearAuthorizationRequestCookie(response);
        return authorizationRequest;
    }

    private Optional<String> getCookieValue(HttpServletRequest request, String cookieName) {
        if (request == null) {
            return Optional.empty();
        }

        Cookie cookie = WebUtils.getCookie(request, cookieName);
        if (cookie == null || !StringUtils.hasText(cookie.getValue())) {
            return Optional.empty();
        }

        return Optional.of(cookie.getValue());
    }

    private String serialize(OAuth2AuthorizationRequest authorizationRequest) {
        try {
            AuthorizationRequestCookieValue cookieValue = AuthorizationRequestCookieValue.from(authorizationRequest);
            byte[] json = objectMapper.writeValueAsBytes(cookieValue);
            return Base64.getUrlEncoder().encodeToString(json);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize OAuth2 authorization request", e);
        }
    }

    private OAuth2AuthorizationRequest deserialize(String cookieValue) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(cookieValue.getBytes(StandardCharsets.UTF_8));
            AuthorizationRequestCookieValue serializedRequest = objectMapper.readValue(
                    decoded,
                    AuthorizationRequestCookieValue.class
            );
            return serializedRequest.toAuthorizationRequest();
        } catch (IllegalArgumentException | IOException e) {
            logger.debug("Ignoring invalid OAuth2 authorization request cookie: {}", e.getMessage());
            return null;
        }
    }

    private void clearAuthorizationRequestCookie(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(
                AUTHORIZATION_REQUEST_COOKIE_NAME,
                "",
                0
        ).toString());
    }

    private ResponseCookie buildCookie(String name, String value, long maxAge) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(securityProperties.getCookies().isSecure())
                .sameSite(securityProperties.getCookies().getSameSite())
                .path(OAUTH2_COOKIE_PATH)
                .maxAge(maxAge);

        if (StringUtils.hasText(securityProperties.getCookies().getDomain())) {
            builder.domain(securityProperties.getCookies().getDomain());
        }

        return builder.build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class AuthorizationRequestCookieValue {

        public String authorizationUri;

        public String clientId;

        public String redirectUri;

        public Set<String> scopes = Set.of();

        public String state;

        public String authorizationRequestUri;

        public Map<String, Object> additionalParameters = Map.of();

        public Map<String, Object> attributes = Map.of();

        static AuthorizationRequestCookieValue from(OAuth2AuthorizationRequest authorizationRequest) {
            AuthorizationRequestCookieValue cookieValue = new AuthorizationRequestCookieValue();
            cookieValue.authorizationUri = authorizationRequest.getAuthorizationUri();
            cookieValue.clientId = authorizationRequest.getClientId();
            cookieValue.redirectUri = authorizationRequest.getRedirectUri();
            cookieValue.scopes = new LinkedHashSet<>(authorizationRequest.getScopes());
            cookieValue.state = authorizationRequest.getState();
            cookieValue.authorizationRequestUri = authorizationRequest.getAuthorizationRequestUri();
            cookieValue.additionalParameters = new LinkedHashMap<>(authorizationRequest.getAdditionalParameters());
            cookieValue.attributes = new LinkedHashMap<>(authorizationRequest.getAttributes());
            return cookieValue;
        }

        OAuth2AuthorizationRequest toAuthorizationRequest() {
            OAuth2AuthorizationRequest.Builder builder = OAuth2AuthorizationRequest.authorizationCode()
                    .authorizationUri(authorizationUri)
                    .clientId(clientId)
                    .redirectUri(redirectUri)
                    .scopes(scopes != null ? scopes : Set.of())
                    .state(state)
                    .additionalParameters(additionalParameters != null ? additionalParameters : Map.of())
                    .attributes(attributes != null ? attributes : Map.of());

            if (StringUtils.hasText(authorizationRequestUri)) {
                builder.authorizationRequestUri(authorizationRequestUri);
            }

            return builder.build();
        }
    }
}
