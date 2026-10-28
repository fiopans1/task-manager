package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

import java.util.regex.Pattern;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class AppShellPage extends BasePage {

    public AppShellPage(Page page) {
        super(page);
    }

    public void expectAuthenticated() {
        assertThat(page).hasURL(Pattern.compile(".*/home(?:/.*)?"));
        assertThat(page.locator("#desktop-sidebar, #sidebar-menu")).hasCount(1);
    }

    public void goToTasks() {
        navigateTo("/home/tasks", "My Tasks");
    }

    public void goToCalendar() {
        navigateTo("/home/calendar", "Calendar");
    }

    public void goToLists() {
        navigateTo("/home/lists", "My Lists");
    }

    public void goToTeams() {
        navigateTo("/home/teams", "Teams");
    }

    public void goToAdmin() {
        navigateTo("/home/admin", "Administration Panel");
    }

    private void navigateTo(String path, String heading) {
        page.locator("a[href='" + path + "']").click();
        page.waitForURL("**" + path);
        assertThat(page.getByRole(AriaRole.HEADING)
                .filter(new Locator.FilterOptions().setHasText(heading))
                .first()).isVisible();
    }

    public void goHome() {
        page.locator("a[href='/home']").first().click();
        page.waitForURL("**/home");
    }

    public boolean hasAdminLink() {
        return page.locator("a[href='/home/admin']").count() > 0;
    }

    public void openUserMenu() {
        page.locator("#user-menu").click();
    }

    public void logout() {
        openUserMenu();
        page.getByText("Log Out", new Page.GetByTextOptions().setExact(true)).click();
        page.waitForURL("**/");
        assertThat(page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in"))).isVisible();
    }

    public void toggleDarkMode() {
        openUserMenu();
        page.locator("#dark-mode-switch").click();
        page.keyboard().press("Escape");
    }

    public String htmlTheme() {
        return page.locator("html").getAttribute("data-bs-theme");
    }

    public void openAbout() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions()
                .setName(Pattern.compile(".*Help.*"))).click();
        page.getByText("About", new Page.GetByTextOptions().setExact(true)).click();
        assertThat(page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("About Task Manager"))).isVisible();
    }

    public void closeAbout() {
        page.locator(".modal.show").getByRole(AriaRole.BUTTON,
                new Locator.GetByRoleOptions().setName("Close")).last().click();
    }

    public void collapseSidebar() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Collapse sidebar")).click();
    }

    public boolean isSidebarCollapsed() {
        return page.locator("#desktop-sidebar.collapsed").count() > 0;
    }

    public void openMobileMenu() {
        page.locator("button[aria-controls='sidebar-menu']").click();
        assertThat(page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Menu"))).isVisible();
    }
}
