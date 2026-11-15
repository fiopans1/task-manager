package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.config.E2EConfig;
import com.taskmanager.e2e.core.BaseTest;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Cross-cutting checks for the new shell: responsive width, the mobile sheet
 * and keyboard navigation. These are intentionally route-level so a layout
 * regression is caught even when no feature test touches the page.
 */
@Tag("smoke")
class UiShellTest extends BaseTest {

    @Test
    void mobileTasksExposeTheFloatingNewTaskButton() {
        loginAsAdmin();
        page.setViewportSize(390, 844);
        page.navigate(E2EConfig.baseUrl() + "/home/tasks");
        page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("My Tasks")).waitFor();

        assertThat(page.getByRole(AriaRole.BUTTON,
                new Page.GetByRoleOptions().setName("New task"))).isVisible();
    }

    @Test
    void skipLinkIsTheFirstFocusTarget() {
        loginAsAdmin();
        page.navigate(E2EConfig.baseUrl() + "/home");
        page.getByRole(AriaRole.HEADING).first().waitFor();

        page.keyboard().press("Tab");

        assertThat(page.getByRole(AriaRole.LINK,
                new Page.GetByRoleOptions().setName("Skip to content"))).isFocused();
    }

    @Test
    void mainRoutesDoNotOverflowHorizontallyOnMobile() {
        loginAsAdmin();
        page.setViewportSize(390, 844);

        List<String> routes = List.of(
                "/home",
                "/home/tasks",
                "/home/lists",
                "/home/teams",
                "/home/calendar",
                "/home/admin",
                "/home/settings"
        );

        for (String route : routes) {
            page.navigate(E2EConfig.baseUrl() + route);
            page.getByRole(AriaRole.HEADING).first().waitFor();
            page.waitForTimeout(350);

            Object result = page.evaluate("""
                    () => ({
                      scrollWidth: document.documentElement.scrollWidth,
                      clientWidth: document.documentElement.clientWidth,
                      innerWidth: window.innerWidth
                    })
                    """);
            @SuppressWarnings("unchecked")
            var sizes = (java.util.Map<String, Object>) result;
            int scrollWidth = ((Number) sizes.get("scrollWidth")).intValue();
            int innerWidth = ((Number) sizes.get("innerWidth")).intValue();

            assertTrue(scrollWidth <= innerWidth + 1,
                    () -> "Horizontal overflow on " + route + ": scrollWidth=" + scrollWidth
                            + ", innerWidth=" + innerWidth);
        }
    }

    @Test
    void mobileLoginShowsCopyrightFooter() {
        page.setViewportSize(390, 844);
        page.navigate(E2EConfig.baseUrl() + "/login");

        var footer = page.locator("[data-testid='auth-footer-mobile']");
        assertThat(footer).isVisible();
        assertThat(footer).containsText("© 2025 TaskManager · Created by fiopans1");
        assertThat(page.locator("[data-testid='auth-footer-desktop']")).isHidden();
    }

    @Test
    void mobileMenuClosesWithEscape() {
        loginAsAdmin();
        page.setViewportSize(390, 844);
        page.reload();

        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Open menu")).click();
        var menu = page.getByRole(AriaRole.DIALOG)
                .filter(new com.microsoft.playwright.Locator.FilterOptions().setHasText("Menu"));
        assertThat(menu).isVisible();

        page.keyboard().press("Escape");
        assertThat(menu).hasCount(0);
    }

    @Test
    void tabsSupportKeyboardNavigation() {
        loginAsAdmin();
        page.navigate(E2EConfig.baseUrl() + "/home/admin");

        var usersTab = page.getByRole(AriaRole.TAB, new Page.GetByRoleOptions().setName("Users"));
        usersTab.focus();
        page.keyboard().press("ArrowRight");

        assertThat(page.getByRole(AriaRole.TAB, new Page.GetByRoleOptions().setName("Features")))
                .isFocused();
    }
}
