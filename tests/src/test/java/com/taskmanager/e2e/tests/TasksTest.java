package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.core.BaseTest;
import com.taskmanager.e2e.pages.TaskDetailsPage;
import com.taskmanager.e2e.pages.TasksPage;
import com.taskmanager.e2e.utils.TaskData;
import com.taskmanager.e2e.utils.Unique;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

@Tag("smoke")
class TasksTest extends BaseTest {

    @Test
    void createSearchRefreshAndDeleteTask() {
        loginAsAdmin();
        String name = Unique.value("task");
        TaskData data = new TaskData(name, "Task description", "CRITICAL", "IN_PROGRESS");
        TasksPage tasks = new TasksPage(page).open();

        tasks.createTask(data);
        assertThat(tasks.card(name)).containsText("CRITICAL");
        assertThat(tasks.card(name)).containsText("IN_PROGRESS");

        tasks.search(name);
        assertThat(tasks.card(name)).isVisible();
        tasks.clearSearch();
        tasks.refresh();
        assertThat(tasks.card(name)).isVisible();

        tasks.deleteTask(name);
        tasks.expectNoTask(name);
    }

    @Test
    void editTaskFromList() {
        loginAsAdmin();
        String name = Unique.value("task edit");
        String updatedName = Unique.value("task edited");
        TasksPage tasks = new TasksPage(page).open();
        tasks.createTask(TaskData.simple(name));

        tasks.editTask(name, new TaskData(updatedName, "Updated description", "LOW", "COMPLETED"));
        assertThat(tasks.card(updatedName)).containsText("COMPLETED");
        tasks.deleteTask(updatedName);
    }

    @Test
    void emptyTaskNameAndEventDatesAreValidated() {
        loginAsAdmin();
        TasksPage tasks = new TasksPage(page).open();
        var modal = tasks.newTask();
        modal.submitCreate();
        modal.expectNameValidation();

        modal.fillName(Unique.value("event validation"));
        modal.fillEventDates(LocalDate.now().plusDays(1), "10:00",
                LocalDate.now().plusDays(1), "09:00");
        modal.submitCreate();
        modal.expectDateValidation("End date must be after start date");
        modal.cancel();
    }

    @Test
    void createEventAndSeeItInCalendar() {
        loginAsAdmin();
        String name = Unique.value("calendar event");
        LocalDate date = LocalDate.now().plusDays(1);
        TasksPage tasks = new TasksPage(page).open();
        tasks.createEvent(TaskData.event(name, "Event description"), date, "10:00", date, "11:00");

        tasks.openTask(name);
        TaskDetailsPage details = new TaskDetailsPage(page);
        details.expectTitle(name);
        assertThat(page.getByText("Event", new Page.GetByTextOptions().setExact(true))).isVisible();

        page.navigate(com.taskmanager.e2e.config.E2EConfig.baseUrl() + "/home/calendar");
        new com.taskmanager.e2e.pages.CalendarPage(page).expectEvent(name);

        new TasksPage(page).open().deleteTask(name);
    }

    @Test
    void searchWithoutMatchesShowsEmptyState() {
        loginAsAdmin();
        TasksPage tasks = new TasksPage(page).open();
        tasks.search(Unique.value("missing"));
        assertThat(page.getByText("No tasks available", new Page.GetByTextOptions().setExact(true))).isVisible();
        tasks.clearSearch();
    }

    @Test
    void taskDetailsSupportsActionsSortingTimerAndDeletion() {
        loginAsAdmin();
        String name = Unique.value("task details");
        String actionTitle = Unique.value("action");
        TasksPage tasks = new TasksPage(page).open();
        tasks.createTask(TaskData.simple(name));
        tasks.openTask(name);

        TaskDetailsPage details = new TaskDetailsPage(page);
        details.expectTitle(name);
        details.addAction(actionTitle, "Action description for " + actionTitle);
        details.searchActions(actionTitle);
        details.sortOldestFirst();

        details.startTimer();
        details.stopTimer();
        details.expectSessionRecorded();

        details.delete();
        tasks.expectNoTask(name);
    }

    @Test
    void taskCanBeDeletedFromDetails() {
        loginAsAdmin();
        String name = Unique.value("task delete details");
        TasksPage tasks = new TasksPage(page).open();
        tasks.createTask(TaskData.simple(name));
        tasks.openTask(name);
        new TaskDetailsPage(page).delete();
        tasks.expectNoTask(name);
    }

    @Test
    void longTaskDescriptionCanBeExpanded() {
        loginAsAdmin();
        String name = Unique.value("task long description");
        TaskData data = new TaskData(name, "D".repeat(150), "MEDIUM", "NEW");
        TasksPage tasks = new TasksPage(page).open();
        tasks.createTask(data);
        tasks.openTask(name);

        TaskDetailsPage details = new TaskDetailsPage(page);
        details.showMoreDescription();
        details.delete();
    }

    @Test
    void taskDetailsCanBeEdited() {
        loginAsAdmin();
        String name = Unique.value("task edit details");
        String updatedName = Unique.value("task edited details");
        TasksPage tasks = new TasksPage(page).open();
        tasks.createTask(TaskData.simple(name));
        tasks.openTask(name);

        new TaskDetailsPage(page).edit(new TaskData(updatedName, "Edited from details", "HIGH", "PAUSSED"));
        assertThat(page.getByText(updatedName, new Page.GetByTextOptions().setExact(true))).isVisible();

        detailsTaskDelete(updatedName);
    }

    private void detailsTaskDelete(String name) {
        new TasksPage(page).open().deleteTask(name);
    }
}
