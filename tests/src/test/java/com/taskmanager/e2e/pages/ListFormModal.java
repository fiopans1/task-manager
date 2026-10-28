package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.microsoft.playwright.options.WaitForSelectorState;
import com.taskmanager.e2e.utils.ListData;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class ListFormModal extends BasePage {

    public ListFormModal(Page page) {
        super(page);
    }

    public ListFormModal expectOpen(boolean editing) {
        String title = editing ? "Edit List" : "New List";
        assertThat(modal().getByText(title,
                new com.microsoft.playwright.Locator.GetByTextOptions().setExact(true)).first()).isVisible();
        return this;
    }

    public ListFormModal waitForPopulatedEdit() {
        assertThat(modal().getByPlaceholder("Name of the list")).not().hasValue("");
        return this;
    }

    public ListFormModal fill(ListData data) {
        modal().getByPlaceholder("Name of the list").fill(data.name());
        modal().getByPlaceholder("Description of the list").fill(data.description());
        modal().locator("input[type='color']").evaluate(
                "(el, value) => { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }",
                data.color());
        return this;
    }

    public void submitCreate() {
        modal().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Create List")).click();
    }

    public void submitUpdate() {
        modal().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Update")).click();
    }

    public void waitClosed() {
        modal().waitFor(new Locator.WaitForOptions().setState(WaitForSelectorState.HIDDEN));
    }
}
