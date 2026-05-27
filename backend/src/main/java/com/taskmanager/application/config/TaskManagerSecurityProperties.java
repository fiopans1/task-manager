package com.taskmanager.application.config;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "taskmanager.security")
public class TaskManagerSecurityProperties {

    private final Cors cors = new Cors();

    private final Cookies cookies = new Cookies();

    private final AccessToken accessToken = new AccessToken();

    private final RefreshToken refreshToken = new RefreshToken();

    private final Csrf csrf = new Csrf();

    public Cors getCors() {
        return cors;
    }

    public Cookies getCookies() {
        return cookies;
    }

    public AccessToken getAccessToken() {
        return accessToken;
    }

    public RefreshToken getRefreshToken() {
        return refreshToken;
    }

    public Csrf getCsrf() {
        return csrf;
    }

    public static class Cors {

        private List<String> allowedOrigins = new ArrayList<>(List.of("http://localhost:3000"));

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public static class Cookies {

        private boolean secure;

        private String sameSite = "Lax";

        private String domain;

        private String accessName = "TM-ACCESS";

        private String refreshName = "TM-REFRESH";

        private String accessPath = "/api";

        private String refreshPath = "/api/session";

        public boolean isSecure() {
            return secure;
        }

        public void setSecure(boolean secure) {
            this.secure = secure;
        }

        public String getSameSite() {
            return sameSite;
        }

        public void setSameSite(String sameSite) {
            this.sameSite = sameSite;
        }

        public String getDomain() {
            return domain;
        }

        public void setDomain(String domain) {
            this.domain = domain;
        }

        public String getAccessName() {
            return accessName;
        }

        public void setAccessName(String accessName) {
            this.accessName = accessName;
        }

        public String getRefreshName() {
            return refreshName;
        }

        public void setRefreshName(String refreshName) {
            this.refreshName = refreshName;
        }

        public String getAccessPath() {
            return accessPath;
        }

        public void setAccessPath(String accessPath) {
            this.accessPath = accessPath;
        }

        public String getRefreshPath() {
            return refreshPath;
        }

        public void setRefreshPath(String refreshPath) {
            this.refreshPath = refreshPath;
        }
    }

    public static class AccessToken {

        private Duration ttl = Duration.ofMinutes(10);

        public Duration getTtl() {
            return ttl;
        }

        public void setTtl(Duration ttl) {
            this.ttl = ttl;
        }
    }

    public static class RefreshToken {

        private Duration ttl = Duration.ofDays(14);

        public Duration getTtl() {
            return ttl;
        }

        public void setTtl(Duration ttl) {
            this.ttl = ttl;
        }
    }

    public static class Csrf {

        private String cookieName = "XSRF-TOKEN";

        private String headerName = "X-XSRF-TOKEN";

        private String parameterName = "_csrf";

        private String path = "/";

        public String getCookieName() {
            return cookieName;
        }

        public void setCookieName(String cookieName) {
            this.cookieName = cookieName;
        }

        public String getHeaderName() {
            return headerName;
        }

        public void setHeaderName(String headerName) {
            this.headerName = headerName;
        }

        public String getParameterName() {
            return parameterName;
        }

        public void setParameterName(String parameterName) {
            this.parameterName = parameterName;
        }

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }
    }

}
