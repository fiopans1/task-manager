package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.config.E2EConfig;
import com.taskmanager.e2e.core.BaseTest;
import com.taskmanager.e2e.pages.DashboardPage;
import com.taskmanager.e2e.pages.LandingPage;
import com.taskmanager.e2e.pages.LoginPage;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.regex.Pattern;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

@Tag("smoke")
class AuthTest extends BaseTest {

    @Test
    void invalidCredentialsKeepUserOnLoginPage() {
        LoginPage login = new LoginPage(page).open();
        login.submitInvalid(E2EConfig.username(), "definitely-wrong-password");
        login.expectLoginError("Login Error");
    }

    @Test
    void userCanLoginReloadAndLogout() {
        loginAsAdmin();
        new DashboardPage(page).open();
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Task Manager"))).isVisible();

        page.reload();
        assertThat(page).hasURL(Pattern.compile(".*/home"));
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Task Manager"))).isVisible();

        new com.taskmanager.e2e.pages.AppShellPage(page).logout();
        assertThat(page).hasURL(E2EConfig.baseUrl() + "/");
    }

    @Test
    void protectedRouteRedirectsAnonymousUserToLandingPage() {
        page.navigate(E2EConfig.baseUrl() + "/home");
        page.waitForURL(E2EConfig.baseUrl() + "/");
        new LandingPage(page).open();
        assertThat(page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in"))).isVisible();
    }

    @Test
    void loginAndRegisterPagesLinkToEachOther() {
        LoginPage login = new LoginPage(page).open();
        assertThat(page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Create one"))).isVisible();
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Create one")).click();
        page.waitForURL("**/register");
        assertThat(page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Sign in"))).isVisible();
    }
}
