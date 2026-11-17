package com.taskmanager.e2e.utils;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Minimal real GitHub OAuth2 provider used by the OAuth linking E2E test.
 * It is a local HTTP server, not a mock of the application: the backend
 * performs the authorization-code exchange and user-info request over HTTP.
 */
public final class FakeGithubOAuthServer implements AutoCloseable {

    private final HttpServer server;
    private final ExecutorService executor;
    private final AtomicReference<String> email = new AtomicReference<>("oauth-default@example.com");

    public FakeGithubOAuthServer(int port) throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
        executor = Executors.newCachedThreadPool();
        server.setExecutor(executor);
        server.createContext("/login/oauth/authorize", this::authorize);
        server.createContext("/login/oauth/access_token", this::token);
        server.createContext("/user", this::user);
        server.createContext("/health", exchange -> respond(exchange, 200, "text/plain", "OK"));
        server.start();
    }

    public String baseUrl() {
        return "http://127.0.0.1:" + server.getAddress().getPort();
    }

    public void setEmail(String value) {
        email.set(value);
    }

    private void authorize(HttpExchange exchange) throws IOException {
        Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
        String redirectUri = query.get("redirect_uri");
        if (redirectUri == null || redirectUri.isBlank()) {
            respond(exchange, 400, "text/plain", "missing redirect_uri");
            return;
        }
        String state = query.getOrDefault("state", "");
        String location = redirectUri + (redirectUri.contains("?") ? "&" : "?")
                + "code=fake-github-code&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Location", location);
        exchange.sendResponseHeaders(302, -1);
        exchange.close();
    }

    private void token(HttpExchange exchange) throws IOException {
        respond(exchange, 200, "application/json", """
                {"access_token":"fake-github-access-token","token_type":"bearer","scope":"read:user,user:email"}
                """);
    }

    private void user(HttpExchange exchange) throws IOException {
        String value = email.get();
        String login = value.substring(0, value.indexOf('@')).replaceAll("[^A-Za-z0-9_-]", "_");
        String body = """
                {"id":%d,"login":%s,"name":"Fake GitHub User","email":%s}
                """.formatted(Math.abs(value.hashCode()), quote(login), quote(value));
        respond(exchange, 200, "application/json", body);
    }

    private static void respond(HttpExchange exchange, int status, String contentType, String body)
            throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", contentType);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }

    private static Map<String, String> parseQuery(String rawQuery) {
        Map<String, String> values = new LinkedHashMap<>();
        if (rawQuery == null || rawQuery.isBlank()) {
            return values;
        }
        for (String pair : rawQuery.split("&")) {
            int separator = pair.indexOf('=');
            if (separator < 0) {
                values.put(decode(pair), "");
            } else {
                values.put(decode(pair.substring(0, separator)), decode(pair.substring(separator + 1)));
            }
        }
        return values;
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static String quote(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    @Override
    public void close() {
        server.stop(0);
        executor.shutdownNow();
    }
}
