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

    public void submitInvalid(String username, String password) {
        dismissSystemMessageIfPresent();
        page.getByLabel("Username").fill(username);
        page.getByLabel("Password").fill(password);
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in")).click();
    }

    public void expectLoginError(String text) {
        assertThat(page.getByRole(AriaRole.ALERT).filter(
                new com.microsoft.playwright.Locator.FilterOptions().setHasText(text))).isVisible();
        assertThat(page).hasURL(java.util.regex.Pattern.compile(".*/login"));
    }
}
