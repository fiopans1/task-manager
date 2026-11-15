package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.PlaywrightException;
import com.microsoft.playwright.options.AriaRole;
import com.microsoft.playwright.options.WaitForSelectorState;
import com.taskmanager.e2e.config.E2EConfig;

import java.util.regex.Pattern;

public abstract class BasePage {

    protected final Page page;

    protected BasePage(Page page) {
        this.page = page;
    }

    protected void open(String path) {
        page.navigate(E2EConfig.baseUrl() + path);
    }

    protected Locator modal() {
        return page.locator("[role='dialog'][data-state='open']").last();
    }

    /**
     * Dismisses the administrator system message if it appears after a login or
     * a full page navigation. Radix hides the background from the accessibility
     * tree while the dialog is open, so role-based queries need it gone first.
     */
    protected void dismissSystemMessageIfPresent() {
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("System Notification"));
        try {
            dialog.first().waitFor(new Locator.WaitForOptions()
                    .setState(WaitForSelectorState.VISIBLE)
                    .setTimeout(2000));
        } catch (PlaywrightException ignored) {
            return;
        }
        if (dialog.first().isVisible()) {
            dialog.first().getByRole(AriaRole.BUTTON,
                    new Locator.GetByRoleOptions().setName("OK")).click();
        }
    }

    protected Locator toast(String text) {
        return page.locator("[data-sonner-toast]")
                .filter(new Locator.FilterOptions().setHasText(text))
                .first();
    }

    protected Locator byRoleButton(String name) {
        return page.getByRole(com.microsoft.playwright.options.AriaRole.BUTTON,
                new Page.GetByRoleOptions().setName(name));
    }

    protected Locator byRoleButton(Pattern name) {
        return page.getByRole(com.microsoft.playwright.options.AriaRole.BUTTON,
                new Page.GetByRoleOptions().setName(name));
    }

    protected Locator byRoleLink(String name) {
        return page.getByRole(com.microsoft.playwright.options.AriaRole.LINK,
                new Page.GetByRoleOptions().setName(name));
    }

    public Page page() {
        return page;
    }
}
