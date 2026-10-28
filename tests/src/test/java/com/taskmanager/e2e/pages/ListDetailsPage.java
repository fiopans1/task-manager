package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.utils.ListData;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class ListDetailsPage extends BasePage {

    public ListDetailsPage(Page page) {
        super(page);
    }

    public ListDetailsPage expectOpen(String listName) {
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("List Management"))).isVisible();
        assertThat(page.locator(".card-header h3").first()).hasText(listName);
        return this;
    }

    public void expectStats() {
        assertThat(page.getByText("Total Tasks", new Page.GetByTextOptions().setExact(true))).isVisible();
        assertThat(page.getByText("Completed", new Page.GetByTextOptions().setExact(true))).isVisible();
        assertThat(page.getByText("Progress", new Page.GetByTextOptions().setExact(true))).isVisible();
    }

    public void addTask(String taskName) {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Add Task")).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Add Tasks to List"));
        assertThat(dialog).isVisible();
        Locator item = dialog.locator(".list-group-item")
                .filter(new Locator.FilterOptions().setHasText(taskName));
        item.click();
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Add Selected Tasks")).click();
        assertThat(toast("Tasks added successfully")).isVisible();
        assertThat(page.getByText(taskName, new Page.GetByTextOptions().setExact(true)).first()).isVisible();
    }

    public void removeTask(String taskName) {
        Locator row = page.locator(".list-group-item")
                .filter(new Locator.FilterOptions().setHasText(taskName))
                .first();
        row.getByTitle("Remove from list").click();
        assertThat(toast("Task removed from list")).isVisible();
        assertThat(page.getByText(taskName, new Page.GetByTextOptions().setExact(true))).hasCount(0);
    }

    public void openTask(String taskName) {
        page.locator(".list-group-item")
                .filter(new Locator.FilterOptions().setHasText(taskName))
                .first()
                .click();
        page.waitForURL("**/home/tasks/*");
    }

    public void edit(ListData updated) {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Edit list")).click();
        ListFormModal modal = new ListFormModal(page);
        modal.expectOpen(true).waitForPopulatedEdit().fill(updated);
        modal.submitUpdate();
        modal.waitClosed();
        assertThat(toast("List updated successfully")).isVisible();
        assertThat(page.locator(".card-header h3").first()).hasText(updated.name());
    }

    public void delete() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Delete list")).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Delete list"));
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Delete list")).click();
        page.waitForURL("**/home/lists");
        assertThat(toast("List deleted successfully")).isVisible();
    }

    public void showMoreDescription() {
        page.getByText("Show More ↓", new Page.GetByTextOptions().setExact(true)).click();
        assertThat(page.getByText("Show Less ↑", new Page.GetByTextOptions().setExact(true))).isVisible();
    }

    public void showMoreDescriptionIfPresent() {
        if (page.getByText("Show More ↓", new Page.GetByTextOptions().setExact(true)).count() > 0) {
            showMoreDescription();
        }
    }

    public boolean hasEmptyState() {
        return page.getByText("No tasks in this list", new Page.GetByTextOptions().setExact(true)).count() > 0;
    }
}
