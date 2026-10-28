package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.config.E2EConfig;
import com.taskmanager.e2e.core.BaseTest;
import com.taskmanager.e2e.pages.DashboardPage;
import com.taskmanager.e2e.pages.LoginPage;
import com.taskmanager.e2e.pages.RegisterPage;
import com.taskmanager.e2e.utils.Unique;
import org.junit.jupiter.api.Test;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

class RegistrationTest extends BaseTest {

    private static final String VALID_PASSWORD = "E2ePass1!";

    @Test
    void passwordMismatchIsRejectedOnTheClientSide() {
        RegisterPage register = new RegisterPage(page).open();
        register.fill("E2E", "User", "", Unique.username("mismatch"),
                Unique.email(Unique.username("mismatch")), VALID_PASSWORD, "OtherPass1!");
        register.submit();
        register.expectError("Passwords do not match");
    }

    @Test
    void weakPasswordIsRejectedByTheBackend() {
        String username = Unique.username("weak");
        RegisterPage register = new RegisterPage(page).open();
        register.fill("E2E", "User", "", username, Unique.email(username), "weakpass", "weakpass");
        register.submit();
        register.expectError("Registration error");
    }

    @Test
    void duplicateUsernameIsRejected() {
        RegisterPage register = new RegisterPage(page).open();
        register.fill("E2E", "User", "", E2EConfig.username(), "other-" + Unique.email("duplicate"),
                VALID_PASSWORD, VALID_PASSWORD);
        register.submit();
        register.expectError("Registration error");
    }

    @Test
    void newUserCanRegisterAndLogin() {
        String username = Unique.username("signup");
        String email = Unique.email(username);

        new RegisterPage(page).open().register("E2E", "Signup", "User", username, email, VALID_PASSWORD);
        assertThat(page).hasURL(java.util.regex.Pattern.compile(".*/login"));

        new LoginPage(page).login(username, VALID_PASSWORD);
        new DashboardPage(page).open();
        assertThat(page.getByRole(AriaRole.HEADING,
                new Page.GetByRoleOptions().setName("Task Manager"))).isVisible();

        new com.taskmanager.e2e.pages.AppShellPage(page).logout();
    }
}
