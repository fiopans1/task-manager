package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.microsoft.playwright.options.WaitForSelectorState;

import java.util.regex.Pattern;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class AdminPage extends BasePage {

    public AdminPage(Page page) {
        super(page);
    }

    public AdminPage open() {
        open("/home/admin");
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions()
                .setName(Pattern.compile(".*Administration Panel.*")))).isVisible();
        return this;
    }

    public AdminPage openTab(String name) {
        page.getByRole(AriaRole.TAB, new Page.GetByRoleOptions()
                .setName(name)).click();
        return this;
    }

    public void searchUser(String username) {
        page.getByPlaceholder("Search users by username...").fill(username);
        byRoleButton(Pattern.compile(".*Search.*")).click();
    }

    public Locator userCard(String username) {
        return page.locator(".card").filter(new Locator.FilterOptions().setHasText(username)).first();
    }

    public void viewUser(String username) {
        userCard(username).getByTitle("View details").click();
        assertThat(page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText(username))).isVisible();
    }

    public void openUserDetailTab(String name) {
        page.getByRole(AriaRole.DIALOG).getByRole(AriaRole.TAB, new Locator.GetByRoleOptions()
                .setName(name)).click();
    }

    public void expectUserDetailRow(String text) {
        assertThat(page.getByRole(AriaRole.DIALOG).locator("tbody tr")
                .filter(new Locator.FilterOptions().setHasText(text)).first()).isVisible();
    }

    public void closeUserDetail() {
        page.getByRole(AriaRole.DIALOG).first().getByRole(AriaRole.BUTTON,
                new Locator.GetByRoleOptions().setName("Close")).click();
        page.getByRole(AriaRole.DIALOG).first().waitFor(new Locator.WaitForOptions()
                .setState(WaitForSelectorState.HIDDEN));
    }

    public boolean isUserBlocked(String username) {
        return userCard(username).getByText("Blocked", new Locator.GetByTextOptions().setExact(true)).count() > 0;
    }

    public void blockUser(String username) {
        userCard(username).getByTitle(Pattern.compile("^Block$")).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Block User"));
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName("Block").setExact(true)).click();
        assertThat(toast("User blocked")).isVisible();
        assertThat(userCard(username)).containsText("Blocked");
    }

    public void unblockUser(String username) {
        userCard(username).getByTitle(Pattern.compile("^Unblock$")).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Unblock User"));
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName("Unblock").setExact(true)).click();
        assertThat(toast("User unblocked")).isVisible();
        assertThat(userCard(username)).not().containsText("Blocked");
    }

    public Locator featureRow(String name) {
        return page.locator("tbody tr").filter(new Locator.FilterOptions().setHasText(name));
    }

    public boolean isFeatureEnabled(String name) {
        return featureRow(name).locator("input[type='checkbox']").isChecked();
    }

    public void toggleFeature(String name) {
        boolean enabled = isFeatureEnabled(name);
        featureRow(name).locator("input[type='checkbox']").click();
        assertThat(toast("\"" + name.toLowerCase() + "\" " + (enabled ? "disabled" : "enabled"))).isVisible();
    }

    public void setSystemMessage(String message, boolean enabled, boolean beforeLogin, boolean afterLogin) {
        setSwitch("#system-message-switch", enabled);
        setCheckbox("#show-before-login", beforeLogin);
        setCheckbox("#show-after-login", afterLogin);
        page.getByPlaceholder("Enter the message to display to users...").fill(message);
        byRoleButton(Pattern.compile(".*Save Message.*")).click();
        assertThat(toast("System message updated")).isVisible();
    }

    public boolean isSystemMessageEnabled() {
        return page.locator("#system-message-switch").isChecked();
    }

    public boolean showsBeforeLogin() {
        return page.locator("#show-before-login").isChecked();
    }

    public boolean showsAfterLogin() {
        return page.locator("#show-after-login").isChecked();
    }

    public String systemMessageText() {
        return page.getByPlaceholder("Enter the message to display to users...").inputValue();
    }

    private void setSwitch(String selector, boolean checked) {
        Locator input = page.locator(selector);
        if (input.isChecked() != checked) {
            input.click();
        }
    }

    private void setCheckbox(String selector, boolean checked) {
        Locator input = page.locator(selector);
        if (input.isChecked() != checked) {
            input.click();
        }
    }
}
