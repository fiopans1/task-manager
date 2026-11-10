package com.taskmanager.e2e.tests;

import com.taskmanager.e2e.config.E2EConfig;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OAuth2CookiePathTest {

    @Test
    void oauthAuthorizationCookieUsesConfiguredPublicPath() throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(E2EConfig.backendUrl() + "/oauth2/authorization/google"))
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(302, response.statusCode(),
                () -> "Expected Google OAuth2 authorization redirect, got HTTP " + response.statusCode()
                        + ": " + response.body());

        List<String> setCookies = response.headers().allValues("set-cookie");
        String authorizationCookie = setCookies.stream()
                .filter(cookie -> cookie.startsWith("TM-OAUTH2-REQUEST="))
                .findFirst()
                .orElseThrow(() -> new AssertionError(
                        "TM-OAUTH2-REQUEST cookie was not returned. Set-Cookie headers: " + setCookies));

        String expectedPath = "Path=" + E2EConfig.oauthCookiePath();
        assertTrue(authorizationCookie.contains(expectedPath + ";")
                        || authorizationCookie.endsWith(expectedPath),
                () -> "OAuth2 cookie does not use the configured public path. Cookie: " + authorizationCookie);
    }
}
