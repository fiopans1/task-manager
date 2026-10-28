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

    public void openTasksQuickLink() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions()
                .setName(java.util.regex.Pattern.compile(".*My Tasks.*"))).click();
        page.waitForURL("**/home/tasks");
    }

    public String statValue(String label) {
        return page.locator(".card")
                .filter(new com.microsoft.playwright.Locator.FilterOptions().setHasText(label))
                .locator("h2")
                .first()
                .innerText();
    }
}
