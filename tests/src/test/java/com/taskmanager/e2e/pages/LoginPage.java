package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class LoginPage extends BasePage {

    public LoginPage(Page page) {
        super(page);
    }

    public LoginPage open() {
        open("/login");
        assertThat(page.getByLabel("Username")).isVisible();
        return this;
    }

    public void login(String username, String password) {
        dismissSystemMessageIfPresent();
        page.getByLabel("Username").fill(username);
        page.getByLabel("Password").fill(password);
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in")).click();
        page.waitForURL("**/home");
        assertThat(page.locator("#desktop-sidebar, #sidebar-menu")).hasCount(1);
    }

    private void dismissSystemMessageIfPresent() {
        var dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new com.microsoft.playwright.Locator.FilterOptions().setHasText("System Notification"));
        if (dialog.count() > 0 && dialog.first().isVisible()) {
            dialog.first().getByRole(AriaRole.BUTTON,
                    new com.microsoft.playwright.Locator.GetByRoleOptions().setName("OK")).click();
        }
    }

    public void submitInvalid(String username, String password) {
        page.getByLabel("Username").fill(username);
        page.getByLabel("Password").fill(password);
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in")).click();
    }

    public void expectLoginError(String text) {
        assertThat(toast(text)).isVisible();
        assertThat(page).hasURL(java.util.regex.Pattern.compile(".*/login"));
    }
}
