package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.microsoft.playwright.options.WaitForSelectorState;
import com.taskmanager.e2e.utils.TeamData;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class TeamFormModal extends BasePage {

    public TeamFormModal(Page page) {
        super(page);
    }

    public TeamFormModal expectOpen(boolean editing) {
        String title = editing ? "Edit Team" : "Create Team";
        assertThat(modal().getByText(title,
                new Locator.GetByTextOptions().setExact(true)).first()).isVisible();
        return this;
    }

    public TeamFormModal waitForPopulatedEdit() {
        assertThat(modal().getByPlaceholder("Enter team name")).not().hasValue("");
        return this;
    }

    public TeamFormModal fill(TeamData data) {
        modal().getByPlaceholder("Enter team name").fill(data.name());
        modal().getByPlaceholder("Team description (optional)").fill(data.description());
        return this;
    }

    public void submitCreate() {
        modal().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Create Team")).click();
    }

    public void submitUpdate() {
        modal().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Save Changes")).click();
    }

    public void waitClosed() {
        modal().waitFor(new Locator.WaitForOptions().setState(WaitForSelectorState.HIDDEN));
    }
}
