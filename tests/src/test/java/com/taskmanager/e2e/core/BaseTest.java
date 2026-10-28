package com.taskmanager.e2e.core;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.Tracing;
import com.taskmanager.e2e.config.E2EConfig;
import com.taskmanager.e2e.pages.LoginPage;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.TestInstance;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.fail;

/**
 * Shared browser lifecycle. Every test gets a fresh browser context so cookies,
 * localStorage and theme state never leak between tests.
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class BaseTest {

    protected Playwright playwright;
    protected Browser browser;
    protected BrowserContext context;
    protected Page page;

    private final List<BrowserContext> extraContexts = new ArrayList<>();
    private final List<String> browserErrors = new ArrayList<>();
    private boolean tracingStarted;

    @BeforeAll
    void launchBrowser() {
        com.microsoft.playwright.assertions.PlaywrightAssertions.setDefaultAssertionTimeout(
                E2EConfig.assertionTimeout().toMillis());
        System.out.printf("[e2e] browser=%s headless=%s slowMo=%.0fms%n",
                E2EConfig.browserName(), E2EConfig.headless(), E2EConfig.slowMoMillis());
        playwright = Playwright.create();
        BrowserType browserType = switch (E2EConfig.browserName()) {
            case "firefox" -> playwright.firefox();
            case "webkit" -> playwright.webkit();
            default -> playwright.chromium();
        };

        browser = browserType.launch(new BrowserType.LaunchOptions()
                .setHeadless(E2EConfig.headless())
                .setSlowMo(E2EConfig.slowMoMillis()));
    }

    @AfterAll
    void closeBrowser() {
        if (browser != null) {
            browser.close();
        }
        if (playwright != null) {
            playwright.close();
        }
    }

    @BeforeEach
    void openContext(TestInfo testInfo) {
        browserErrors.clear();
        context = newContext();
        page = context.newPage();
        configurePage(page);

        if (E2EConfig.tracingEnabled()) {
            context.tracing().start(new Tracing.StartOptions()
                    .setScreenshots(true)
                    .setSnapshots(true)
                    .setSources(true));
            tracingStarted = true;
        }
    }

    @AfterEach
    void closeContext(TestInfo testInfo) {
        try {
            Path artifacts = E2EConfig.artifactsDir();
            Files.createDirectories(artifacts);
            String baseName = safeName(testInfo.getTestClass().map(Class::getSimpleName).orElse("Unknown")
                    + "_" + testInfo.getTestMethod().map(java.lang.reflect.Method::getName).orElse("test"));

            if (page != null && !page.isClosed()) {
                page.screenshot(new Page.ScreenshotOptions()
                        .setPath(artifacts.resolve(baseName + ".png"))
                        .setFullPage(true));
            }

            if (!browserErrors.isEmpty()) {
                Files.writeString(artifacts.resolve(baseName + "-browser-errors.log"),
                        String.join(System.lineSeparator(), browserErrors));
            }

            if (tracingStarted) {
                context.tracing().stop(new Tracing.StopOptions()
                        .setPath(artifacts.resolve(baseName + "-trace.zip")));
                tracingStarted = false;
            }
        } catch (RuntimeException | IOException e) {
            // Artifact collection must never hide the real test result.
            System.err.println("Could not collect E2E artifacts: " + e.getMessage());
        } finally {
            extraContexts.forEach(BrowserContext::close);
            extraContexts.clear();
            if (context != null) {
                context.close();
            }
        }
    }

    protected BrowserContext newContext() {
        BrowserContext created = browser.newContext(new Browser.NewContextOptions()
                .setViewportSize(1440, 900)
                .setLocale("en-US")
                .setTimezoneId("UTC"));
        if (context != null && created != context) {
            extraContexts.add(created);
        }
        return created;
    }

    protected Page newPage() {
        BrowserContext created = newContext();
        Page createdPage = created.newPage();
        configurePage(createdPage);
        return createdPage;
    }

    protected Page loginAsAdmin() {
        login(page, E2EConfig.username(), E2EConfig.password());
        return page;
    }

    protected Page loginAsCollaborator() {
        Page collaborator = newPage();
        login(collaborator, E2EConfig.collaboratorUsername(), E2EConfig.collaboratorPassword());
        return collaborator;
    }

    protected void login(Page target, String username, String password) {
        new LoginPage(target)
                .open()
                .login(username, password);
        dismissSystemMessageIfPresent(target);
    }

    protected void dismissSystemMessageIfPresent(Page target) {
        var dialog = target.getByRole(com.microsoft.playwright.options.AriaRole.DIALOG)
                .filter(new com.microsoft.playwright.Locator.FilterOptions().setHasText("System Notification"));
        if (dialog.count() > 0 && dialog.first().isVisible()) {
            dialog.first().getByRole(com.microsoft.playwright.options.AriaRole.BUTTON,
                    new com.microsoft.playwright.Locator.GetByRoleOptions().setName("OK")).click();
        }
    }

    protected void expectBrowserError(String message) {
        browserErrors.add(message);
        fail(message);
    }

    private void configurePage(Page target) {
        target.setDefaultTimeout(E2EConfig.timeout().toMillis());
        target.setDefaultNavigationTimeout(E2EConfig.timeout().toMillis());
        target.onConsoleMessage(message -> {
            if ("error".equals(message.type())) {
                browserErrors.add("console error: " + message.text());
            }

        });
        target.onPageError(error -> browserErrors.add("page error: " + error));

    }

    private static String safeName(String value) {
        return value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9._-]+", "-");
    }
}
