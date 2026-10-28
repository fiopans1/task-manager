package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.core.BaseTest;
import com.taskmanager.e2e.pages.ListDetailsPage;
import com.taskmanager.e2e.pages.ListsPage;
import com.taskmanager.e2e.pages.TasksPage;
import com.taskmanager.e2e.utils.ListData;
import com.taskmanager.e2e.utils.TaskData;
import com.taskmanager.e2e.utils.Unique;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

@Tag("smoke")
class ListsTest extends BaseTest {

    @Test
    void createSearchEditAndDeleteList() {
        loginAsAdmin();
        String name = Unique.value("list");
        String updatedName = Unique.value("list edited");
        ListsPage lists = new ListsPage(page).open();

        lists.createList(ListData.simple(name));
        lists.search(name);
        assertThat(lists.card(name)).isVisible();
        lists.clearSearch();

        lists.editList(name, new ListData(updatedName, "Updated list description", "#dc3545"));
        lists.deleteList(updatedName);
        lists.expectNoList(updatedName);
    }

    @Test
    void listDetailsAddsAndRemovesTasksWithoutDeletingThem() {
        loginAsAdmin();
        String taskName = Unique.value("list task");
        String listName = Unique.value("list details");
        new TasksPage(page).open().createTask(TaskData.simple(taskName));

        ListsPage lists = new ListsPage(page).open();
        lists.createList(ListData.simple(listName));
        lists.openList(listName);
        String listUrl = page.url();

        ListDetailsPage details = new ListDetailsPage(page).expectOpen(listName);
        details.expectStats();
        details.addTask(taskName);
        details.removeTask(taskName);
        details.showMoreDescriptionIfPresent();

        page.navigate(com.taskmanager.e2e.config.E2EConfig.baseUrl() + "/home/tasks");
        assertThat(new TasksPage(page).card(taskName)).isVisible();

        page.navigate(listUrl);
        details.addTask(taskName);
        details.openTask(taskName);
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Task Overview"))).isVisible();

        new TasksPage(page).open().deleteTask(taskName);
        page.navigate(listUrl);
        new ListDetailsPage(page).delete();
    }

    @Test
    void deletingListKeepsItsTasks() {
        loginAsAdmin();
        String taskName = Unique.value("list keep task");
        String listName = Unique.value("list delete");
        new TasksPage(page).open().createTask(TaskData.simple(taskName));
        ListsPage lists = new ListsPage(page).open();
        lists.createList(ListData.simple(listName));
        lists.openList(listName);

        ListDetailsPage details = new ListDetailsPage(page).expectOpen(listName);
        details.addTask(taskName);
        details.delete();
        assertThat(page).hasURL(java.util.regex.Pattern.compile(".*/home/lists"));

        new TasksPage(page).open().expectTask(taskName);
        new TasksPage(page).open().deleteTask(taskName);
    }

    @Test
    void longListDescriptionCanBeExpanded() {
        loginAsAdmin();
        String listName = Unique.value("list description");
        ListsPage lists = new ListsPage(page).open();
        lists.createList(ListData.withLongDescription(listName));
        lists.openList(listName);

        ListDetailsPage details = new ListDetailsPage(page).expectOpen(listName);
        details.showMoreDescription();
        details.delete();
    }

    @Test
    void listSearchWithoutMatchesShowsEmptyState() {
        loginAsAdmin();
        ListsPage lists = new ListsPage(page).open();
        lists.search(Unique.value("missing list"));
        assertThat(page.getByText("No lists available", new Page.GetByTextOptions().setExact(true))).isVisible();
        lists.clearSearch();
    }
}
