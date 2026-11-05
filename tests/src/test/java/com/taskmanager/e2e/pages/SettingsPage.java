package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

import java.util.regex.Pattern;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class SettingsPage extends BasePage {

    public SettingsPage(Page page) {
        super(page);
    }

    public SettingsPage open() {
        open("/home/settings");
        expectProfileTab();
        return this;
    }

    public SettingsPage openFromUserMenu() {
        new AppShellPage(page).openSettings();
        expectProfileTab();
        return this;
    }

    public void expectProfileTab() {
        assertThat(page).hasURL(Pattern.compile(".*/home/settings"));
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Settings")))
                .isVisible();
        assertThat(page.getByRole(AriaRole.TAB, new Page.GetByRoleOptions().setName("Profile")))
                .isVisible();
        assertThat(page.getByLabel("Username")).isVisible();
        assertThat(page.getByLabel("Email")).isVisible();
    }

    public void fillProfile(String name, String surname1, String surname2, String username, String email) {
        page.getByLabel("First Name").fill(name);
        page.getByLabel("Surname 1").fill(surname1);
        page.getByLabel("Surname 2").fill(surname2);
        page.getByLabel("Username").fill(username);
        page.getByLabel("Email").fill(email);
    }

    public void saveProfile() {
        byRoleButton("Save changes").click();
    }

    public void expectProfileSaved() {
        assertThat(toast("Profile updated successfully")).isVisible();
    }

    public void expectUsername(String username) {
        assertThat(page.getByLabel("Username")).hasValue(username);
    }

    public void expectEmail(String email) {
        assertThat(page.getByLabel("Email")).hasValue(email);
    }

    public void expectSidebarDisplayName(String displayName) {
        assertThat(page.locator("#user-menu")).containsText(displayName);
    }

    public void openChangePasswordModal() {
        byRoleButton("Change password").click();
        assertThat(page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Change password"))).isVisible();
    }

    public void expectPasswordWarning() {
        Locator warning = modal().getByTestId("change-password-warning");
        assertThat(warning).isVisible();
        assertThat(warning).containsText("all active sessions");
        assertThat(warning).containsText("sign in again");
    }

    public void fillChangePassword(String currentPassword, String newPassword, String confirmPassword) {
        Locator dialog = modal();
        dialog.getByLabel("Current password").fill(currentPassword);
        dialog.getByLabel("New password", new Locator.GetByLabelOptions().setExact(true)).fill(newPassword);
        dialog.getByLabel("Confirm new password").fill(confirmPassword);
    }

    public void submitChangePassword() {
        modal().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName("Update password")).click();
    }

    public void closePasswordModal() {
        modal().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName("Cancel")).click();
    }

    public void expectRedirectedToLogin() {
        page.waitForURL("**/login");
        assertThat(page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions()
                .setName("Sign in"))).isVisible();
    }

    public void expectErrorToast(String text) {
        assertThat(toast(text)).isVisible();
    }
}
