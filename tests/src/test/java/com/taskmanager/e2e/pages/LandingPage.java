package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class LandingPage extends BasePage {

    public LandingPage(Page page) {
        super(page);
    }

    public LandingPage open() {
        open("/");
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Task Manager"))).isVisible();
        return this;
    }

    public LoginPage goToLogin() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in")).click();
        page.waitForURL("**/login");
        return new LoginPage(page);
    }

    public RegisterPage goToRegister() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Create account")).click();
        page.waitForURL("**/register");
        return new RegisterPage(page);
    }

    public boolean hasSsoButton() {
        return page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Continue with SSO")).count() > 0;
    }

    public void toggleTheme() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Toggle dark mode")).click();
    }

    public String htmlTheme() {
        return page.locator("html").getAttribute("data-bs-theme");
    }
}
