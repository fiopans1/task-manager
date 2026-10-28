package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.utils.TaskData;

import java.time.LocalDate;
import java.util.regex.Pattern;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class TasksPage extends BasePage {

    public TasksPage(Page page) {
        super(page);
    }

    public TasksPage open() {
        open("/home/tasks");
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("My Tasks"))).isVisible();
        return this;
    }

    public TaskFormModal newTask() {
        byRoleButton(Pattern.compile(".*New Task")).click();
        TaskFormModal modal = new TaskFormModal(page);
        modal.expectOpen(false);
        return modal;
    }

    public void createTask(TaskData data) {
        TaskFormModal modal = newTask().fill(data);
        modal.submitCreate();
        modal.waitClosed();
        assertThat(toast("Task created successfully")).isVisible();
        expectTask(data.name());
    }

    public void createEvent(TaskData data, LocalDate startDate, String startTime,
                            LocalDate endDate, String endTime) {
        TaskFormModal modal = newTask().fill(data).fillEventDates(startDate, startTime, endDate, endTime);
        modal.submitCreate();
        modal.waitClosed();
        assertThat(toast("Task created successfully")).isVisible();
        expectTask(data.name());
    }

    public Locator card(String name) {
        return page.locator(".item-card").filter(new Locator.FilterOptions().setHasText(name));
    }

    public void expectTask(String name) {
        assertThat(card(name)).isVisible();
    }

    public void expectNoTask(String name) {
        assertThat(page.getByText(name, new Page.GetByTextOptions().setExact(true))).hasCount(0);
    }

    public void search(String text) {
        page.getByPlaceholder("Search tasks").fill(text);
        byRoleButton("Search").click();
    }

    public void clearSearch() {
        byRoleButton("Clear").click();
    }

    public void refresh() {
        byRoleButton("Refresh").click();
    }

    public void openTask(String name) {
        card(name).getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName(Pattern.compile(".*View.*"))).click();
        page.waitForURL("**/home/tasks/*");
    }

    public void editTask(String name, TaskData updated) {
        card(name).getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName(Pattern.compile(".*Edit.*"))).click();
        TaskFormModal modal = new TaskFormModal(page);
        modal.expectOpen(true).waitForPopulatedEdit().fill(updated);
        modal.submitSave();
        modal.waitClosed();
        assertThat(toast("Task updated successfully")).isVisible();
        expectTask(updated.name());
    }

    public void deleteTask(String name) {
        card(name).getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName(Pattern.compile(".*Delete.*"))).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Confirm deletion"));
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Delete Task")).click();
        assertThat(toast("Task deleted successfully")).isVisible();
        expectNoTask(name);
    }
}
