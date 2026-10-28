package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.core.BaseTest;
import com.taskmanager.e2e.pages.DashboardPage;
import com.taskmanager.e2e.pages.ListsPage;
import com.taskmanager.e2e.pages.TasksPage;
import com.taskmanager.e2e.utils.ListData;
import com.taskmanager.e2e.utils.TaskData;
import com.taskmanager.e2e.utils.Unique;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

@Tag("smoke")
class DashboardTest extends BaseTest {

    @Test
    void dashboardShowsStatsRecentTasksUpcomingEventsAndQuickLinks() {
        loginAsAdmin();
        String taskName = Unique.value("dashboard task");
        String listName = Unique.value("dashboard list");
        String eventName = Unique.value("dashboard event");

        TasksPage tasks = new TasksPage(page).open();
        tasks.createTask(TaskData.simple(taskName));
        tasks.createEvent(TaskData.event(eventName, "Dashboard event"),
                LocalDate.now().plusDays(1), "10:00",
                LocalDate.now().plusDays(1), "11:00");

        new ListsPage(page).open().createList(ListData.simple(listName));

        DashboardPage dashboard = new DashboardPage(page).open();
        dashboard.expectTask(taskName);
        dashboard.expectEvent(eventName);
        assertThat(page.getByText("Total tasks", new Page.GetByTextOptions().setExact(true)).first()).isVisible();
        assertThat(page.getByText("Lists created", new Page.GetByTextOptions().setExact(true)).first()).isVisible();
        assertThat(page.getByText("Upcoming events", new Page.GetByTextOptions().setExact(true)).first()).isVisible();

        dashboard.openTasksQuickLink();
        assertThat(page).hasURL(java.util.regex.Pattern.compile(".*/home/tasks"));

        new TasksPage(page).open().deleteTask(taskName);
        new TasksPage(page).open().deleteTask(eventName);
        new ListsPage(page).open().deleteList(listName);
    }

    @Test
    void dashboardRecentTaskOpensTaskDetails() {
        loginAsAdmin();
        String taskName = Unique.value("dashboard open");
        TasksPage tasks = new TasksPage(page).open();
        tasks.createTask(TaskData.simple(taskName));

        new DashboardPage(page).open();
        page.getByText(taskName, new Page.GetByTextOptions().setExact(true)).click();
        page.waitForURL("**/home/tasks/*");
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Task Overview"))).isVisible();

        new TasksPage(page).open().deleteTask(taskName);
    }
}
