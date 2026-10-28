package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
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
        return page.locator(".modal.show");
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
