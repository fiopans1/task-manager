package com.taskmanager.e2e.utils;

import java.io.IOException;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;

/**
 * Real HTTP client used by the security regression tests. It talks to the
 * running backend, keeps the same cookie jar a browser would use and primes
 * the CSRF token through the public endpoint. No mocks or in-process stubs.
 */
public final class ApiSession {

    private final String baseUrl;
    private final CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
    private final HttpClient client;
    private String username;

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public ApiSession(String baseUrl) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.client = HttpClient.newBuilder()
                .cookieHandler(cookies)
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public Response get(String path) {
        return send("GET", path, null, false);
    }

    public Response postJson(String path, String body) {
        return send("POST", path, body, true);
    }

    public Response putJson(String path, String body) {
        return send("PUT", path, body, true);
    }

    public Response delete(String path) {
        return send("DELETE", path, null, true);
    }

    public Response register(String username, String email, String password) {
        return postJson("/auth/register", """
                {"username":%s,"email":%s,"password":%s,"name":{"name":"E2E","surname1":"Security","surname2":"Test"}}
                """.formatted(json(username), json(email), json(password)));
    }

    public Response login(String username, String password) {
        return postJson("/auth/login", """
                {"username":%s,"password":%s}
                """.formatted(json(username), json(password)));
    }

    public Optional<String> cookie(String name) {
        return cookies.getCookieStore().getCookies().stream()
                .filter(cookie -> cookie.getName().equals(name))
                .map(java.net.HttpCookie::getValue)
                .findFirst();
    }

    public String sessionId() {
        Response response = get("/api/session/me");
        String body = response.body();
        int marker = body.indexOf("\"sessionId\":\"");
        if (marker < 0) {
            throw new IllegalStateException("No sessionId in response: " + body);
        }
        int start = marker + "\"sessionId\":\"".length();
        int end = body.indexOf('"', start);
        return body.substring(start, end);
    }

    private Response send(String method, String path, String body, boolean csrf) {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .timeout(Duration.ofSeconds(20));

            if (body != null) {
                builder.header("Content-Type", "application/json");
            }
            if (csrf) {
                builder.header("X-XSRF-TOKEN", csrfToken());
            }

            HttpRequest request = builder
                    .method(method, body == null
                            ? HttpRequest.BodyPublishers.noBody()
                            : HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return new Response(response.statusCode(), response.body(), response);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("HTTP " + method + " " + path + " was interrupted", e);
        } catch (IOException e) {
            throw new IllegalStateException("HTTP " + method + " " + path + " failed", e);
        }
    }

    private String csrfToken() {
        Response response = get("/api/session/csrf");
        if (response.status() >= 400) {
            throw new IllegalStateException("Could not obtain CSRF token: HTTP " + response.status());
        }
        return cookie("XSRF-TOKEN")
                .orElseThrow(() -> new IllegalStateException("XSRF-TOKEN cookie was not set"));
    }

    private static String json(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    public record Response(int status, String body, HttpResponse<String> raw) {

        public boolean ok() {
            return status >= 200 && status < 300;
        }

        public String header(String name) {
            return raw.headers().firstValue(name).orElse("");
        }
    }
}
