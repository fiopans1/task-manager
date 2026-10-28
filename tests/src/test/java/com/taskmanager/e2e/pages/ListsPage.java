package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.utils.ListData;

import java.util.regex.Pattern;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class ListsPage extends BasePage {

    public ListsPage(Page page) {
        super(page);
    }

    public ListsPage open() {
        open("/home/lists");
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("My Lists"))).isVisible();
        return this;
    }

    public ListFormModal newList() {
        byRoleButton(Pattern.compile(".*New List")).click();
        ListFormModal modal = new ListFormModal(page);
        modal.expectOpen(false);
        return modal;
    }

    public void createList(ListData data) {
        ListFormModal modal = newList().fill(data);
        modal.submitCreate();
        modal.waitClosed();
        assertThat(toast("List created successfully")).isVisible();
        expectList(data.name());
    }

    public Locator card(String name) {
        return page.locator(".item-card").filter(new Locator.FilterOptions().setHasText(name));
    }

    public void expectList(String name) {
        assertThat(card(name)).isVisible();
    }

    public void expectNoList(String name) {
        assertThat(page.getByText(name, new Page.GetByTextOptions().setExact(true))).hasCount(0);
    }

    public void search(String text) {
        page.getByPlaceholder("Search lists").fill(text);
        byRoleButton("Search").click();
    }

    public void clearSearch() {
        byRoleButton("Clear").click();
    }

    public void openList(String name) {
        card(name).getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName(Pattern.compile(".*Open.*"))).click();
        page.waitForURL("**/home/lists/*");
    }

    public void editList(String name, ListData updated) {
        card(name).getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName(Pattern.compile(".*Edit.*"))).click();
        ListFormModal modal = new ListFormModal(page);
        modal.expectOpen(true).waitForPopulatedEdit().fill(updated);
        modal.submitUpdate();
        modal.waitClosed();
        assertThat(toast("List updated successfully")).isVisible();
        expectList(updated.name());
    }

    public void deleteList(String name) {
        card(name).getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName(Pattern.compile(".*Delete.*"))).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Confirm deletion"));
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Delete List")).click();
        assertThat(toast("List deleted successfully")).isVisible();
        expectNoList(name);
    }
}
