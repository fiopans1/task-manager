package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.microsoft.playwright.options.WaitForSelectorState;
import com.taskmanager.e2e.utils.TaskData;

import java.time.LocalDate;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class TaskFormModal extends BasePage {

    public TaskFormModal(Page page) {
        super(page);
    }

    @Override
    protected Locator modal() {
        return page.locator(".modal.show.task-modal");
    }

    public TaskFormModal expectOpen(boolean editing) {
        String title = editing ? "Edit Task" : "New Task";
        assertThat(modal().getByText(title,
                new Locator.GetByTextOptions().setExact(true)).first()).isVisible();
        return this;
    }

    public TaskFormModal waitForPopulatedEdit() {
        assertThat(modal().locator("input[name='nameOfTask']")).not().hasValue("");
        return this;
    }

    public TaskFormModal fill(TaskData data) {
        Locator name = modal().locator("input[name='nameOfTask']");
        Locator description = modal().locator("textarea[name='descriptionOfTask']");
        Locator priority = modal().locator("select[name='priority']");
        Locator state = modal().locator("select[name='state']");

        name.fill(data.name());
        description.fill(data.description());
        priority.selectOption(data.priority());
        state.selectOption(data.status());

        assertThat(name).hasValue(data.name());
        assertThat(description).hasValue(data.description());
        assertThat(priority).hasValue(data.priority());
        assertThat(state).hasValue(data.status());
        return this;
    }

    public TaskFormModal fillName(String name) {
        modal().locator("input[name='nameOfTask']").fill(name);
        return this;
    }

    public TaskFormModal enableEvent() {
        Locator checkbox = modal().locator("#event-switch");
        if (!checkbox.isChecked()) {
            checkbox.check();
        }
        return this;
    }

    public TaskFormModal disableEvent() {
        Locator checkbox = modal().locator("#event-switch");
        if (checkbox.isChecked()) {
            checkbox.uncheck();
        }
        return this;
    }

    public TaskFormModal fillEventDates(LocalDate startDate, String startTime,
                                        LocalDate endDate, String endTime) {
        enableEvent();
        Locator dateInputs = modal().locator("input[type='date']");
        Locator timeInputs = modal().locator("input[type='time']");
        dateInputs.nth(0).fill(startDate.toString());
        timeInputs.nth(0).fill(startTime);
        dateInputs.nth(1).fill(endDate.toString());
        timeInputs.nth(1).fill(endTime);
        return this;
    }

    public void submitCreate() {
        modal().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Create")).click();
    }

    public void submitSave() {
        modal().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Save Changes")).click();
    }

    public void cancel() {
        modal().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Cancel")).click();
        modal().waitFor(new Locator.WaitForOptions().setState(WaitForSelectorState.HIDDEN));
    }

    public void expectNameValidation() {
        assertThat(modal().getByText("Task name is required")).isVisible();
    }

    public void expectDateValidation(String message) {
        assertThat(modal().getByText(message)).isVisible();
    }

    public void waitClosed() {
        modal().waitFor(new Locator.WaitForOptions().setState(WaitForSelectorState.HIDDEN));
    }
}
