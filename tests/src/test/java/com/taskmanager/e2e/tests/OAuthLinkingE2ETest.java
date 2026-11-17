package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Page;
import com.taskmanager.e2e.config.E2EConfig;
import com.taskmanager.e2e.core.BaseTest;
import com.taskmanager.e2e.utils.ApiSession;
import com.taskmanager.e2e.utils.FakeGithubOAuthServer;
import com.taskmanager.e2e.utils.Unique;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.regex.Pattern;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Real OAuth2 E2E coverage: a local HTTP server plays GitHub (authorization,
 * token and user-info endpoints), while the real backend performs the
 * authorization-code exchange and the real browser follows the redirects.
 */
class OAuthLinkingE2ETest extends BaseTest {

    private static final String PASSWORD = "E2ePass1!";

    private FakeGithubOAuthServer github;

    @BeforeAll
    void startFakeGithub() throws Exception {
        github = new FakeGithubOAuthServer(E2EConfig.oauthFakeProviderPort());

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(E2EConfig.backendUrl() + "/oauth2/authorization/github"))
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String location = response.headers().firstValue("location").orElse("");

        Assumptions.assumeTrue(location.startsWith(github.baseUrl()),
                "Backend GitHub provider is not configured for the local fake IdP at "
                        + github.baseUrl() + " (got " + response.statusCode() + " " + location + ")");
    }

    @AfterAll
    void stopFakeGithub() {
        if (github != null) {
            github.close();
        }
    }

    @Test
    void oauthLoginRejectsAPreRegisteredLocalEmail() {
        String username = Unique.username("oauthlocal");
        String email = Unique.email(username);
        ApiSession local = new ApiSession(E2EConfig.backendUrl());
        assertEquals(200, local.register(username, email, PASSWORD).status(),
                "The local account must be created before the OAuth login");

        github.setEmail(email);
        page.navigate(E2EConfig.baseUrl() + "/oauth2/authorization/github");
        page.waitForURL("**/oauth2-login");

        assertThat(page.locator("[data-sonner-toast]")
                .filter(new com.microsoft.playwright.Locator.FilterOptions()
                        .setHasText("already registered"))
                .first()).isVisible();

        ApiSession stillLocal = new ApiSession(E2EConfig.backendUrl());
        assertEquals(200, stillLocal.login(username, PASSWORD).status(),
                "A rejected OAuth login must not change the local account");
    }

    @Test
    void oauthLoginCreatesANewAccountAndAllowsRepeatLogin() {
        String email = Unique.email(Unique.username("oauthnew"));
        github.setEmail(email);

        page.navigate(E2EConfig.baseUrl() + "/oauth2/authorization/github");
        page.waitForURL("**/home");
        assertThat(page).hasURL(Pattern.compile(".*/home"));

        Page second = newPage();
        second.navigate(E2EConfig.baseUrl() + "/oauth2/authorization/github");
        second.waitForURL("**/home");
        assertThat(second).hasURL(Pattern.compile(".*/home"));
    }
}
