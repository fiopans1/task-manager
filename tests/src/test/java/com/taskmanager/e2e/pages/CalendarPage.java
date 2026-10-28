package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class CalendarPage extends BasePage {

    public CalendarPage(Page page) {
        super(page);
    }

    public CalendarPage open() {
        open("/home/calendar");
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Calendar"))).isVisible();
        assertThat(page.locator(".rbc-calendar")).isVisible();
        return this;
    }

    public void expectEvent(String name) {
        assertThat(page.locator(".rbc-event").filter(new com.microsoft.playwright.Locator.FilterOptions().setHasText(name))).isVisible();
    }

    public void view(String name, String expectedClass) {
        exactButton(name).click();
        assertThat(page.locator(expectedClass)).isVisible();
    }

    public void navigate(String button) {
        exactButton(button).click();
        assertThat(page.locator(".rbc-toolbar-label")).isVisible();
    }

    public void clickToday() {
        exactButton("Today").click();
    }

    private com.microsoft.playwright.Locator exactButton(String name) {
        return page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions()
                .setName(name)
                .setExact(true));
    }

    public void expectLegend() {
        assertThat(page.getByText("Work", new Page.GetByTextOptions().setExact(true))).isVisible();
        assertThat(page.getByText("Personal", new Page.GetByTextOptions().setExact(true))).isVisible();
        assertThat(page.getByText("Urgent", new Page.GetByTextOptions().setExact(true))).isVisible();
    }
}
