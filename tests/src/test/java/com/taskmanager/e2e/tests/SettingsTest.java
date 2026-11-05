package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.config.E2EConfig;
import com.taskmanager.e2e.core.BaseTest;
import com.taskmanager.e2e.pages.AppShellPage;
import com.taskmanager.e2e.pages.LoginPage;
import com.taskmanager.e2e.pages.RegisterPage;
import com.taskmanager.e2e.pages.SettingsPage;
import com.taskmanager.e2e.utils.Unique;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

class SettingsTest extends BaseTest {

    private static final String PASSWORD = "E2ePass1!";
    private static final String NEW_PASSWORD = "E2ePass2@";

    @Test
    @Tag("smoke")
    void settingsOpensFromUserMenuAndShowsProfile() {
        loginAsAdmin();

        new SettingsPage(page).openFromUserMenu().expectUsername(E2EConfig.username());
    }

    @Test
    @Tag("smoke")
    void changePasswordModalShowsWarning() {
        loginAsAdmin();

        SettingsPage settings = new SettingsPage(page).openFromUserMenu();
        settings.openChangePasswordModal();
        settings.expectPasswordWarning();
        settings.closePasswordModal();
    }

    @Test
    void profileCanChangeNameUsernameAndEmail() {
        String username = Unique.username("settings_profile");
        String email = Unique.email(username);
        registerAndLogin(username, email);

        SettingsPage settings = new SettingsPage(page).openFromUserMenu();

        String newUsername = Unique.username("settings_renamed");
        String newEmail = Unique.email(newUsername);

        settings.fillProfile("E2E", "Renamed", "User", newUsername, newEmail);
        settings.saveProfile();
        settings.expectProfileSaved();
        settings.expectSidebarDisplayName("E2E Renamed User");

        page.reload();
        settings.expectProfileTab();
        settings.expectUsername(newUsername);
        settings.expectEmail(newEmail);

        new AppShellPage(page).logout();

        LoginPage login = new LoginPage(page).open();
        login.submitInvalid(username, PASSWORD);
        login.expectLoginError("Login Error");

        login.login(newUsername, PASSWORD);
        assertThat(page).hasURL(java.util.regex.Pattern.compile(".*/home"));
    }

    @Test
    void changePasswordLogsOutEverySessionAndRequiresNewPassword() {
        String username = Unique.username("settings_password");
        String email = Unique.email(username);
        registerAndLogin(username, email);

        Page secondSession = newPage();
        login(secondSession, username, PASSWORD);

        SettingsPage settings = new SettingsPage(page).openFromUserMenu();
        settings.openChangePasswordModal();
        settings.expectPasswordWarning();
        settings.fillChangePassword(PASSWORD, NEW_PASSWORD, NEW_PASSWORD);
        settings.submitChangePassword();
        settings.expectRedirectedToLogin();

        secondSession.reload();
        secondSession.waitForURL(E2EConfig.baseUrl() + "/");
        assertThat(secondSession.getByRole(AriaRole.BUTTON,
                new Page.GetByRoleOptions().setName("Sign in"))).isVisible();

        LoginPage login = new LoginPage(page).open();
        login.submitInvalid(username, PASSWORD);
        login.expectLoginError("Login Error");

        login.login(username, NEW_PASSWORD);
        assertThat(page).hasURL(java.util.regex.Pattern.compile(".*/home"));
    }

    @Test
    void changePasswordRejectsWrongCurrentPassword() {
        String username = Unique.username("settings_wrong_password");
        String email = Unique.email(username);
        registerAndLogin(username, email);

        SettingsPage settings = new SettingsPage(page).openFromUserMenu();
        settings.openChangePasswordModal();
        settings.fillChangePassword("WrongPass1!", NEW_PASSWORD, NEW_PASSWORD);
        settings.submitChangePassword();
        settings.expectErrorToast("Current password is incorrect");
        settings.expectProfileTab();

        settings.closePasswordModal();
    }

    private void registerAndLogin(String username, String email) {
        new RegisterPage(page).open()
                .register("E2E", "Settings", "User", username, email, PASSWORD);
        login(page, username, PASSWORD);
    }
}
