package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class RegisterPage extends BasePage {

    public RegisterPage(Page page) {
        super(page);
    }

    public RegisterPage open() {
        open("/register");
        assertThat(page.getByLabel("Username")).isVisible();
        return this;
    }

    public void fill(String name, String surname1, String surname2, String username,
                     String email, String password, String confirmPassword) {
        page.getByLabel("First Name").fill(name);
        page.getByLabel("Surname 1").fill(surname1);
        page.getByLabel("Surname 2").fill(surname2);
        page.getByLabel("Username").fill(username);
        page.getByLabel("Email").fill(email);
        page.getByLabel("Password", new Page.GetByLabelOptions().setExact(true)).fill(password);
        page.getByLabel("Confirm Password").fill(confirmPassword);
    }

    public void submit() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Create account")).click();
    }

    public void register(String name, String surname1, String surname2, String username,
                         String email, String password) {
        fill(name, surname1, surname2, username, email, password, password);
        submit();
        page.waitForURL("**/login");
        assertThat(toast("User registered successfully")).isVisible();
    }

    public void expectError(String text) {
        assertThat(toast(text)).isVisible();
        assertThat(page).hasURL(java.util.regex.Pattern.compile(".*/register"));
    }
}
