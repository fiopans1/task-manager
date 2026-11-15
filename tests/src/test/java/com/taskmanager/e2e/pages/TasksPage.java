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
        return page.locator("[data-testid='item-card']").filter(new Locator.FilterOptions().setHasText(name));
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

    public void filterByStatus(String status) {
        page.getByLabel("Filter by status").selectOption(status);
    }

    public void filterByPriority(String priority) {
        page.getByLabel("Filter by priority").selectOption(priority);
    }

    public void clearFilters() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Clear filters")).first().click();
    }

    private Locator bulkBar() {
        return page.getByRole(AriaRole.REGION, new Page.GetByRoleOptions().setName("Bulk actions"));
    }

    public void selectTask(String name) {
        card(name).getByRole(AriaRole.CHECKBOX,
                new Locator.GetByRoleOptions().setName("Select " + name)).check();
    }

    public void expectBulkCount(int count) {
        assertThat(bulkBar()).containsText(count + " selected");
    }

    public void bulkComplete() {
        bulkBar().getByRole(AriaRole.BUTTON,
                new Locator.GetByRoleOptions().setName("Mark complete")).click();
    }

    public void bulkDelete(int count) {
        bulkBar().getByRole(AriaRole.BUTTON,
                new Locator.GetByRoleOptions().setName("Delete")).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Delete selected tasks"));
        String label = count == 1 ? "Delete task" : "Delete " + count + " tasks";
        dialog.getByRole(AriaRole.BUTTON,
                new Locator.GetByRoleOptions().setName(label)).click();
    }

    public void openTask(String name) {
        card(name).getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName(Pattern.compile(".*Open.*"))).click();
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
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Delete task")).click();
        assertThat(toast("Task deleted successfully")).isVisible();
        expectNoTask(name);
    }
}
