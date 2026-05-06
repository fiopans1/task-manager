package com.taskmanager.application.security;

import com.taskmanager.application.config.TaskManagerSecurityProperties;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.WebUtils;

@Component
public class SessionCookieService {

    @Autowired
    private TaskManagerSecurityProperties securityProperties;

    @PostConstruct
    public void init() {
        validateConfiguration();
    }

    public void addAuthenticationCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(
                securityProperties.getCookies().getAccessName(),
                accessToken,
                securityProperties.getCookies().getAccessPath(),
                securityProperties.getAccessToken().getTtl().toSeconds(),
                true
        ).toString());

        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(
                securityProperties.getCookies().getRefreshName(),
                refreshToken,
                securityProperties.getCookies().getRefreshPath(),
                securityProperties.getRefreshToken().getTtl().toSeconds(),
                true
        ).toString());
    }

    public void clearAuthenticationCookies(HttpServletResponse response) {
        clearAccessCookie(response);
        clearRefreshCookie(response);
    }

    public void clearAccessCookie(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(
                securityProperties.getCookies().getAccessName(),
                "",
                securityProperties.getCookies().getAccessPath(),
                0,
                true
        ).toString());
    }

    public void clearRefreshCookie(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(
                securityProperties.getCookies().getRefreshName(),
                "",
                securityProperties.getCookies().getRefreshPath(),
                0,
                true
        ).toString());
    }

    public Optional<String> getAccessToken(HttpServletRequest request) {
        return getCookieValue(request, securityProperties.getCookies().getAccessName());
    }

    public Optional<String> getRefreshToken(HttpServletRequest request) {
        return getCookieValue(request, securityProperties.getCookies().getRefreshName());
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

    private ResponseCookie buildCookie(String name, String value, String path, long maxAge, boolean httpOnly) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(httpOnly)
                .secure(securityProperties.getCookies().isSecure())
                .sameSite(securityProperties.getCookies().getSameSite())
                .path(path)
                .maxAge(maxAge);

        if (StringUtils.hasText(securityProperties.getCookies().getDomain())) {
            builder.domain(securityProperties.getCookies().getDomain());
        }

        return builder.build();
    }

    private void validateConfiguration() {
        if ("None".equalsIgnoreCase(securityProperties.getCookies().getSameSite())
                && !securityProperties.getCookies().isSecure()) {
            throw new IllegalStateException("SameSite=None requires taskmanager.security.cookies.secure=true");
        }
    }
}
