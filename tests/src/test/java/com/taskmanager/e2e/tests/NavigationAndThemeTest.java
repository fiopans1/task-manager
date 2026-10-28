package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.core.BaseTest;
import com.taskmanager.e2e.pages.AppShellPage;
import com.taskmanager.e2e.pages.LandingPage;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

@Tag("smoke")
class NavigationAndThemeTest extends BaseTest {

    @Test
    void sidebarNavigatesToEveryMainSection() {
        loginAsAdmin();
        AppShellPage shell = new AppShellPage(page);

        shell.goToTasks();
        shell.goToCalendar();
        shell.goToLists();
        shell.goToTeams();
        shell.goToAdmin();
        shell.goHome();
    }

    @Test
    void sidebarCanBeCollapsedAndExpanded() {
        loginAsAdmin();
        AppShellPage shell = new AppShellPage(page);
        shell.collapseSidebar();
        assertThat(page.locator("#desktop-sidebar.collapsed")).isVisible();
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Expand sidebar")).click();
        assertThat(page.locator("#desktop-sidebar.collapsed")).hasCount(0);
    }

    @Test
    void aboutDialogOpensAndCloses() {
        loginAsAdmin();
        AppShellPage shell = new AppShellPage(page);
        shell.openAbout();
        shell.closeAbout();
        assertThat(page.locator(".modal.show")).hasCount(0);
    }

    @Test
    void darkModeCanBeChangedInsideTheApplicationAndPersists() {
        loginAsAdmin();
        AppShellPage shell = new AppShellPage(page);
        String initial = shell.htmlTheme();
        shell.toggleDarkMode();
        String changed = shell.htmlTheme();
        org.junit.jupiter.api.Assertions.assertNotEquals(initial, changed);

        page.reload();
        assertThat(page.locator("html")).hasAttribute("data-bs-theme", changed);
    }

    @Test
    void mobileMenuOpensTheOffcanvasSidebar() {
        loginAsAdmin();
        page.setViewportSize(390, 844);
        page.reload();
        new AppShellPage(page).openMobileMenu();
        assertThat(page.getByText("Menu", new Page.GetByTextOptions().setExact(true))).isVisible();
    }

    @Test
    void adminLinkIsNotVisibleForBasicUser() {
        Page basic = loginAsCollaborator();
        new AppShellPage(basic).goHome();
        assertThat(basic.locator("a[href='/home/admin']")).hasCount(0);
    }

    @Test
    void publicThemeToggleAlsoWorks() {
        LandingPage landing = new LandingPage(page).open();
        String initial = landing.htmlTheme();
        landing.toggleTheme();
        org.junit.jupiter.api.Assertions.assertNotEquals(initial, landing.htmlTheme());
    }
}
