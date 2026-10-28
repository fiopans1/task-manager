package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.core.BaseTest;
import com.taskmanager.e2e.pages.LandingPage;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

@Tag("smoke")
class PublicPagesTest extends BaseTest {

    @Test
    void landingPageShowsPublicActionsAndThemeCanBeChanged() {
        LandingPage landing = new LandingPage(page).open();

        assertThat(page).hasTitle(java.util.regex.Pattern.compile(".*Task Manager.*"));
        assertThat(page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in"))).isVisible();
        assertThat(page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Create account"))).isVisible();
        if (landing.hasSsoButton()) {
            assertThat(page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions()
                    .setName("Continue with SSO"))).isVisible();
        }

        String initialTheme = landing.htmlTheme();
        landing.toggleTheme();
        String changedTheme = landing.htmlTheme();
        org.junit.jupiter.api.Assertions.assertNotEquals(initialTheme, changedTheme);

        page.reload();
        assertThat(page.locator("html")).hasAttribute("data-bs-theme", changedTheme);
    }

    @Test
    void publicPagesExposeSeoMetadata() {
        new LandingPage(page).open();
        assertThat(page.locator("meta[name='description']").last()).hasAttribute("content",
                java.util.regex.Pattern.compile(".*Task Manager.*"));

        page.navigate(com.taskmanager.e2e.config.E2EConfig.baseUrl() + "/login");
        assertThat(page).hasTitle(java.util.regex.Pattern.compile(".*Sign in.*Task Manager.*"));
        assertThat(page.locator("link[rel='canonical']")).hasAttribute("href",
                java.util.regex.Pattern.compile(".*/login"));
    }

    @Test
    void healthRouteRendersOk() {
        page.navigate(com.taskmanager.e2e.config.E2EConfig.baseUrl() + "/health");
        assertThat(page.getByText("OK", new Page.GetByTextOptions().setExact(true))).isVisible();
    }

    @Test
    void oauthLoginPageIsAvailableAndShowsProvidersWhenEnabled() {
        page.navigate(com.taskmanager.e2e.config.E2EConfig.baseUrl() + "/oauth2-login");
        assertThat(page.getByText("Quick access", new Page.GetByTextOptions().setExact(true))).isVisible();
        assertThat(page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Sign in"))).isVisible();
        assertThat(page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Create account"))).isVisible();

        if (page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Google")).count() > 0) {
            assertThat(page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Google"))).isVisible();
        }
    }

    @Test
    void oauthCallbackErrorIsShownToTheUser() {
        page.navigate(com.taskmanager.e2e.config.E2EConfig.baseUrl()
                + "/oauth2-login?error=access_denied&message=Temporary%20OAuth%20error");
        assertThat(page.locator("[data-sonner-toast]")
                .filter(new com.microsoft.playwright.Locator.FilterOptions()
                        .setHasText("Temporary OAuth error"))).isVisible();
    }
}
