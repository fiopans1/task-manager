package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class DashboardPage extends BasePage {

    public DashboardPage(Page page) {
        super(page);
    }

    public DashboardPage open() {
        open("/home");
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Task Manager"))).isVisible();
        return this;
    }

    public void expectTask(String name) {
        assertThat(page.getByText(name, new Page.GetByTextOptions().setExact(true)).first()).isVisible();
    }

    public void expectEvent(String name) {
        assertThat(page.getByText(name, new Page.GetByTextOptions().setExact(true)).last()).isVisible();
    }

    public void expectFooterPinnedToViewportBottom() {
        Number gap = (Number) page.evaluate("""
                () => {
                    const footer = document.querySelector("[data-testid='dashboard-footer']");
                    if (!footer) return null;
                    return window.innerHeight - footer.getBoundingClientRect().bottom;
                }
                """);
        org.junit.jupiter.api.Assertions.assertNotNull(
                gap, "footer should sit against the bottom of the viewport");
        org.junit.jupiter.api.Assertions.assertTrue(
                gap.doubleValue() >= 0.0 && gap.doubleValue() <= 48.0,
                "footer should sit against the bottom of the viewport, gap was " + gap);

        Boolean scrollable = (Boolean) page.evaluate(
                "() => document.documentElement.scrollHeight > window.innerHeight + 2");
        org.junit.jupiter.api.Assertions.assertFalse(
                Boolean.TRUE.equals(scrollable), "a short dashboard should not scroll");

        assertThat(page.locator("[data-testid='dashboard-footer']"))
                .containsText("© 2025 TaskManager · Created by fiopans1");
    }

    public void openTasksQuickLink() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions()
                .setName(java.util.regex.Pattern.compile(".*My Tasks.*"))).click();
        page.waitForURL("**/home/tasks");
    }
}
