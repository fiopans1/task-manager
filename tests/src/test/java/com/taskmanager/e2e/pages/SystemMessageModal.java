package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.PlaywrightException;
import com.microsoft.playwright.options.AriaRole;
import com.microsoft.playwright.options.WaitForSelectorState;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class SystemMessageModal extends BasePage {

    public SystemMessageModal(Page page) {
        super(page);
    }

    private Locator dialog() {
        return page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("System Notification"));
    }

    public boolean isVisible() {
        return dialog().count() > 0 && dialog().first().isVisible();
    }

    public void expectVisible(String message) {
        assertThat(dialog()).isVisible();
        assertThat(dialog()).containsText(message);
    }

    public void expectHidden() {
        assertThat(dialog()).hasCount(0);
    }

    public void dismiss() {
        if (isVisible()) {
            dialog().getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("OK")).click();
            expectHidden();
        }
    }

    public void waitAndDismiss() {
        try {
            dialog().first().waitFor(new Locator.WaitForOptions()
                    .setState(WaitForSelectorState.VISIBLE)
                    .setTimeout(2000));
        } catch (PlaywrightException ignored) {
            // No system message is configured for this context.
        }
        dismiss();
    }
}
