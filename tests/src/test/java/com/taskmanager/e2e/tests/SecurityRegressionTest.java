package com.taskmanager.e2e.tests;

import com.taskmanager.e2e.config.E2EConfig;
import com.taskmanager.e2e.utils.ApiSession;
import com.taskmanager.e2e.utils.JwtTestToken;
import com.taskmanager.e2e.utils.Unique;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Black-box regression tests for the confirmed security findings. They talk to
 * the real backend over HTTP and use the same cookie/CSRF flow as a browser.
 * No service, repository or controller is mocked.
 */
class SecurityRegressionTest {

    private static final String PASSWORD = "E2ePass1!";
    private static final Pattern ID = Pattern.compile("\"id\"\\s*:\\s*(\\d+)");

    @Test
    void registrationCannotAssignAdminRoleOrOverwriteAnExistingAccount() {
        String username = Unique.username("roleless");
        String email = Unique.email(username);

        ApiSession anonymous = new ApiSession(E2EConfig.backendUrl());
        ApiSession.Response registration = anonymous.postJson("/auth/register", """
                {"username":%s,"email":%s,"password":%s,
                 "roles":[{"id":1,"name":"ADMIN"}],"blocked":false}
                """.formatted(json(username), json(email), json(PASSWORD)));

        assertEquals(200, registration.status(), registration.body());
        assertEquals(200, anonymous.login(username, PASSWORD).status());

        ApiSession.Response session = anonymous.get("/api/session/me");
        assertTrue(session.body().contains("ROLE_BASIC"), session.body());
        assertFalse(session.body().contains("ROLE_ADMIN"), session.body());
        assertEquals(403, anonymous.get("/api/admin/users").status(),
                "A self-registered account must not reach the admin API");

        ApiSession victim = createUser("idvictim");
        String victimUsername = usernameOf(victim);
        ApiSession admin = adminSession();
        String victimId = idFrom(admin.get("/api/admin/users?query=" + victimUsername).body());

        String replacement = Unique.username("takeover");
        ApiSession.Response overwriteAttempt = new ApiSession(E2EConfig.backendUrl()).postJson("/auth/register", """
                {"id":%s,"username":%s,"email":%s,"password":"OtherPass1!"}
                """.formatted(victimId, json(replacement), json(Unique.email(replacement))));

        assertTrue(overwriteAttempt.status() == 200 || overwriteAttempt.status() == 400,
                "Unexpected registration status: " + overwriteAttempt.status() + " " + overwriteAttempt.body());

        assertEquals(200, victim.login(victimUsername, PASSWORD).status(),
                "The existing account row must not be overwritten by a client-supplied id");
        assertTrue(admin.get("/api/admin/users?query=" + victimUsername).body().contains(victimUsername),
                "The original account must still exist under its original username");
    }

    @Test
    void createEndpointsCannotOverwriteForeignTasksOrLists() {
        ApiSession victim = createUser("objvictim");
        ApiSession attacker = createUser("objattacker");

        String taskName = Unique.value("victim task");
        ApiSession.Response task = victim.postJson("/api/tasks/create", """
                {"nameOfTask":%s,"descriptionOfTask":"victim only","state":"NEW","priority":"HIGH","isEvent":false}
                """.formatted(json(taskName)));
        assertEquals(200, task.status(), task.body());
        String taskId = idFrom(task.body());

        ApiSession.Response taskOverwrite = attacker.postJson("/api/tasks/create", """
                {"id":%s,"nameOfTask":"stolen task","descriptionOfTask":"attacker","state":"NEW","priority":"LOW","isEvent":false}
                """.formatted(taskId));
        assertEquals(400, taskOverwrite.status(), taskOverwrite.body());
        assertEquals(200, victim.get("/api/tasks/" + taskId).status());
        assertTrue(victim.get("/api/tasks/" + taskId).body().contains(taskName));
        assertEquals(403, attacker.get("/api/tasks/" + taskId).status());

        String listName = Unique.value("victim list");
        ApiSession.Response list = victim.postJson("/api/lists/create", """
                {"nameOfList":%s,"descriptionOfList":"victim only","color":"#112233"}
                """.formatted(json(listName)));
        assertEquals(200, list.status(), list.body());
        String listId = idFrom(list.body());

        ApiSession.Response listOverwrite = attacker.postJson("/api/lists/create", """
                {"id":%s,"nameOfList":"stolen list","descriptionOfList":"attacker","color":"#000000"}
                """.formatted(listId));
        assertEquals(400, listOverwrite.status(), listOverwrite.body());
        assertEquals(200, victim.get("/api/lists/getList/" + listId).status());
        assertTrue(victim.get("/api/lists/getList/" + listId).body().contains(listName));
        assertEquals(403, attacker.get("/api/lists/getList/" + listId).status());
    }

    @Test
    void actionCreateCannotOverwriteForeignAction() {
        ApiSession victim = createUser("actionvictim");
        ApiSession attacker = createUser("actionattacker");

        String victimTask = idFrom(victim.postJson("/api/tasks/create", """
                {"nameOfTask":"victim action task","descriptionOfTask":"private","state":"NEW","priority":"HIGH","isEvent":false}
                """).body());
        ApiSession.Response action = victim.postJson("/api/tasks/" + victimTask + "/actions", """
                {"actionName":"victim note","actionDescription":"PRIVATE ACTION","actionType":"COMMENT"}
                """);
        assertEquals(200, action.status(), action.body());
        String actionId = idFrom(action.body());

        String attackerTask = idFrom(attacker.postJson("/api/tasks/create", """
                {"nameOfTask":"attacker action task","descriptionOfTask":"mine","state":"NEW","priority":"LOW","isEvent":false}
                """).body());
        ApiSession.Response overwrite = attacker.postJson("/api/tasks/" + attackerTask + "/actions", """
                {"id":%s,"actionName":"pwned note","actionDescription":"attacker","actionType":"COMMENT"}
                """.formatted(actionId));
        assertEquals(400, overwrite.status(), overwrite.body());

        ApiSession.Response victimActions = victim.get("/api/tasks/" + victimTask + "/actions");
        assertTrue(victimActions.body().contains("victim note"), victimActions.body());
    }

    @Test
    void listCannotAttachAnotherUsersTask() {
        ApiSession victim = createUser("listvictim");
        ApiSession attacker = createUser("listattacker");

        String secret = Unique.value("private task");
        ApiSession.Response task = victim.postJson("/api/tasks/create", """
                {"nameOfTask":%s,"descriptionOfTask":"PRIVATE-CONTENT","state":"NEW","priority":"HIGH","isEvent":false}
                """.formatted(json(secret)));
        assertEquals(200, task.status(), task.body());
        String taskId = idFrom(task.body());

        ApiSession.Response list = attacker.postJson("/api/lists/create", """
                {"nameOfList":"attacker list","descriptionOfList":"mine","color":"#00FF00"}
                """);
        assertEquals(200, list.status(), list.body());
        String listId = idFrom(list.body());

        ApiSession.Response attach = attacker.postJson("/api/lists/addTasksToList/" + listId, "[" + taskId + "]");
        assertEquals(403, attach.status(), attach.body());

        ApiSession.Response attackerList = attacker.get("/api/lists/getList/" + listId);
        assertFalse(attackerList.body().contains("PRIVATE-CONTENT"), attackerList.body());
        ApiSession.Response victimTask = victim.get("/api/tasks/" + taskId);
        assertFalse(victimTask.body().contains("\"listId\""), victimTask.body());
    }

    @Test
    void teamAdminCannotAssignAnUnrelatedTask() {
        ApiSession victim = createUser("teamvictim");
        ApiSession attacker = createUser("teamattacker");

        String secret = Unique.value("team private");
        ApiSession.Response task = victim.postJson("/api/tasks/create", """
                {"nameOfTask":%s,"descriptionOfTask":"TEAM-PRIVATE","state":"NEW","priority":"HIGH","isEvent":false}
                """.formatted(json(secret)));
        assertEquals(200, task.status(), task.body());
        String taskId = idFrom(task.body());

        ApiSession.Response team = attacker.postJson("/api/teams/create", """
                {"name":%s,"description":"attacker team"}
                """.formatted(json(Unique.value("attacker team"))));
        assertEquals(200, team.status(), team.body());
        String teamId = idFrom(team.body());

        ApiSession.Response assignment = attacker.postJson(
                "/api/teams/" + teamId + "/tasks/" + taskId + "/assign",
                "{\"username\":\"" + attacker.getUsername() + "\"}");
        assertEquals(403, assignment.status(), assignment.body());

        ApiSession.Response victimTask = victim.get("/api/tasks/" + taskId);
        assertEquals(200, victimTask.status());
        assertTrue(victimTask.body().contains("\"user\":\"" + victim.getUsername() + "\""), victimTask.body());
        assertFalse(victimTask.body().contains("\"teamId\""), victimTask.body());
    }

    @Test
    void forgedSubjectWithTheRealSigningKeyIsRejected() {
        Path key = E2EConfig.jwtPrivateKeyPath();
        Assumptions.assumeTrue(Files.isRegularFile(key), "JWT private key not available at " + key);

        ApiSession basic = new ApiSession(E2EConfig.backendUrl());
        assertEquals(200, basic.login(E2EConfig.collaboratorUsername(), E2EConfig.collaboratorPassword()).status());
        String sessionId = basic.sessionId();

        HttpClient raw = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        String legitimate = JwtTestToken.sign(key, E2EConfig.collaboratorUsername(), sessionId,
                Duration.ofMinutes(5));
        HttpRequest legitimateRequest = HttpRequest.newBuilder()
                .uri(URI.create(E2EConfig.backendUrl() + "/api/session/me"))
                .header("Cookie", "TM-ACCESS=" + legitimate)
                .timeout(Duration.ofSeconds(20))
                .GET()
                .build();
        HttpResponse<String> legitimateResponse = send(raw, legitimateRequest);
        assertEquals(200, legitimateResponse.statusCode(),
                "The test key must match the running server before testing a forged subject");

        String forged = JwtTestToken.sign(key, E2EConfig.username(), sessionId, Duration.ofMinutes(5));
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(E2EConfig.backendUrl() + "/api/admin/users"))
                .header("Cookie", "TM-ACCESS=" + forged)
                .timeout(Duration.ofSeconds(20))
                .GET()
                .build();

        HttpResponse<String> response = send(raw, request);
        assertEquals(401, response.statusCode(),
                "A token whose subject does not own the referenced session must be rejected");
    }

    @Test
    void systemMessageHonoursItsAudienceFlags() {
        ApiSession admin = adminSession();
        ApiSession basic = new ApiSession(E2EConfig.backendUrl());
        assertEquals(200, basic.login(E2EConfig.collaboratorUsername(), E2EConfig.collaboratorPassword()).status());

        String secret = "SECURITY-MESSAGE-" + UUID.randomUUID();
        try {
            ApiSession.Response set = admin.putJson("/api/admin/system-message", """
                    {"message":%s,"enabled":true,"showBeforeLogin":false,"showAfterLogin":true}
                    """.formatted(json(secret)));
            assertEquals(200, set.status(), set.body());

            ApiSession anonymous = new ApiSession(E2EConfig.backendUrl());
            assertFalse(anonymous.get("/api/config").body().contains(secret),
                    "Anonymous callers must not receive a not-before-login message");
            assertTrue(basic.get("/api/config").body().contains(secret),
                    "Authenticated users should receive an after-login message");

            admin.putJson("/api/admin/system-message", """
                    {"message":%s,"enabled":true,"showBeforeLogin":false,"showAfterLogin":false}
                    """.formatted(json(secret)));
            assertFalse(basic.get("/api/config").body().contains(secret),
                    "showAfterLogin=false must hide the message from authenticated users");
        } finally {
            admin.putJson("/api/admin/system-message",
                    "{\"message\":\"\",\"enabled\":false,\"showBeforeLogin\":false,\"showAfterLogin\":true}");
        }
    }

    @Test
    void packagingDefaultsKeepTlsCookiesAndProxySafe() throws Exception {
        Path root = Paths.get(System.getProperty("user.dir")).resolve("..").normalize();
        String application = Files.readString(root.resolve("scripts/config_templates/application-properties.template"));
        String caddy = Files.readString(root.resolve("scripts/config_templates/Caddyfile.template"));
        String frontend = Files.readString(root.resolve("scripts/config_templates/config.template.js"));
        String dockerfile = Files.readString(root.resolve("docker/Dockerfile.deployment"));

        assertTrue(application.contains("taskmanager.security.cookies.secure=true"), application);
        assertTrue(application.contains("taskmanager.security.cors.allowed-origins"), application);
        assertFalse(application.contains("\n# taskmanager.cors.allowed-origins"), application);
        assertTrue(caddy.contains("reverse_proxy @backend localhost:8080"), caddy);
        assertTrue(frontend.contains("baseUrl: \"\""), frontend);
        assertTrue(dockerfile.contains("USER app"), dockerfile);
        assertFalse(Files.exists(root.resolve("application/src/main/resources/jwtKeys/private_key.pem")),
                "The historical JWT private key must be removed from the worktree");
    }

    private ApiSession adminSession() {
        ApiSession admin = new ApiSession(E2EConfig.backendUrl());
        assertEquals(200, admin.login(E2EConfig.username(), E2EConfig.password()).status());
        return admin;
    }

    private ApiSession createUser(String prefix) {
        String username = Unique.username(prefix);
        ApiSession session = new ApiSession(E2EConfig.backendUrl());
        ApiSession.Response registration = session.register(username, Unique.email(username), PASSWORD);
        assertEquals(200, registration.status(), registration.body());
        assertEquals(200, session.login(username, PASSWORD).status());
        session.setUsername(username);
        return session;
    }

    private static String usernameOf(ApiSession session) {
        return session.getUsername();
    }

    private static String idFrom(String body) {
        Matcher matcher = ID.matcher(body);
        assertTrue(matcher.find(), () -> "No id in response: " + body);
        return matcher.group(1);
    }

    private static HttpResponse<String> send(HttpClient client, HttpRequest request) {
        try {
            return client.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            throw new IllegalStateException("HTTP request failed", e);
        }
    }

    private static String json(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }
}
