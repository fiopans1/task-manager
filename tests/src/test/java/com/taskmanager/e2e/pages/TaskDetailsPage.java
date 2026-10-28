package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.utils.TaskData;

import java.util.regex.Pattern;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class TaskDetailsPage extends BasePage {

    public TaskDetailsPage(Page page) {
        super(page);
    }

    public TaskDetailsPage open(long taskId) {
        open("/home/tasks/" + taskId);
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Task Overview"))).isVisible();
        return this;
    }

    public TaskDetailsPage expectTitle(String name) {
        assertThat(page.locator(".card-header h3").first()).hasText(name);
        return this;
    }

    public void edit(TaskData updated) {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Edit task")).click();
        TaskFormModal modal = new TaskFormModal(page);
        modal.expectOpen(true).waitForPopulatedEdit().fill(updated);
        modal.submitSave();
        modal.waitClosed();
        assertThat(toast("Task updated successfully")).isVisible();
        expectTitle(updated.name());
    }

    public void delete() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Delete task")).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Delete task"));
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Delete task")).click();
        page.waitForURL("**/home/tasks");
        assertThat(toast("Task deleted successfully")).isVisible();
    }

    public void startTimer() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Start timer")).click();
        assertThat(page.getByText("Tracking", new Page.GetByTextOptions().setExact(true))).isVisible();
        assertThat(page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Stop timer"))).isVisible();
    }

    public void stopTimer() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Stop timer")).click();
        assertThat(page.getByText("Idle", new Page.GetByTextOptions().setExact(true))).isVisible();
        assertThat(toast("Timer stopped")).isVisible();
    }

    public void expectSessionRecorded() {
        assertThat(page.locator("table tbody tr").first()).isVisible();
        assertThat(page.locator("table tbody")).containsText("admin");
    }

    public void addAction(String title, String description) {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("New Action")).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("New Action"));
        dialog.locator("input[name='actionName']").fill(title);
        dialog.locator("textarea[name='actionDescription']").fill(description);
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Save Action")).click();
        assertThat(toast("Action saved successfully")).isVisible();
        assertThat(page.getByText(title, new Page.GetByTextOptions().setExact(true))).isVisible();
    }

    public void searchActions(String text) {
        page.getByPlaceholder("Search actions...").fill(text);
        assertThat(page.getByPlaceholder("Search actions...")).hasValue(text);
    }

    public void sortOldestFirst() {
        page.locator("#dropdown-sort").click();
        page.getByText("Oldest first", new Page.GetByTextOptions().setExact(true)).click();
        assertThat(page.locator("#dropdown-sort")).containsText("Oldest first");
    }

    public void expectAction(String title) {
        assertThat(page.getByText(title, new Page.GetByTextOptions().setExact(true))).isVisible();
    }

    public long actionCount() {
        return page.locator(".card").filter(new Locator.FilterOptions()
                .setHasText("Action History")).count();
    }

    public boolean hasEventBadge() {
        return page.getByText("Event", new Page.GetByTextOptions().setExact(true)).count() > 0;
    }

    public boolean hasDescriptionLink() {
        return page.getByText(Pattern.compile("Show More")).count() > 0;
    }

    public void showMoreDescription() {
        page.getByText("Show More ↓", new Page.GetByTextOptions().setExact(true)).click();
        assertThat(page.getByText("Show Less ↑", new Page.GetByTextOptions().setExact(true))).isVisible();
    }
}
