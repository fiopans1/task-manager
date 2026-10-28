package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.config.E2EConfig;
import com.taskmanager.e2e.core.BaseTest;
import com.taskmanager.e2e.pages.AdminPage;
import com.taskmanager.e2e.pages.AppShellPage;
import com.taskmanager.e2e.pages.DashboardPage;
import com.taskmanager.e2e.pages.LoginPage;
import com.taskmanager.e2e.pages.SystemMessageModal;
import com.taskmanager.e2e.utils.Unique;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.regex.Pattern;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

@Tag("smoke")
class AdminPanelTest extends BaseTest {

    @Test
    void adminCanSearchInspectAndBlockUsers() {
        loginAsAdmin();
        AdminPage admin = new AdminPage(page).open();
        String collaborator = E2EConfig.collaboratorUsername();

        admin.searchUser(collaborator);
        if (admin.isUserBlocked(collaborator)) {
            admin.unblockUser(collaborator);
        }
        admin.viewUser(collaborator);
        admin.openUserDetailTab("Tasks");
        admin.openUserDetailTab("Lists");
        admin.openUserDetailTab("Teams");
        admin.closeUserDetail();

        try {
            admin.blockUser(collaborator);
            assertThat(admin.userCard(collaborator)).containsText("Blocked");

            Page blocked = newPage();
            LoginPage blockedLogin = new LoginPage(blocked).open();
            blockedLogin.submitInvalid(collaborator, E2EConfig.collaboratorPassword());
            blockedLogin.expectLoginError("Login Error");
        } finally {
            if (admin.isUserBlocked(collaborator)) {
                admin.unblockUser(collaborator);
            }
        }

        Page basic = loginAsCollaborator();
        new DashboardPage(basic).open();
        assertThat(basic.getByRole(AriaRole.HEADING,
                new Page.GetByRoleOptions().setName("Task Manager"))).isVisible();
    }

    @Test
    void adminCanEditAndDeleteAnotherUsersTask() {
        String originalName = Unique.value("admin managed task");
        String updatedName = Unique.value("admin managed task edited");
        Page basic = loginAsCollaborator();
        new com.taskmanager.e2e.pages.TasksPage(basic).open()
                .createTask(com.taskmanager.e2e.utils.TaskData.simple(originalName));

        loginAsAdmin();
        AdminPage admin = new AdminPage(page).open();
        String collaborator = E2EConfig.collaboratorUsername();
        admin.searchUser(collaborator);
        admin.viewUser(collaborator);
        admin.openUserDetailTab("Tasks");

        var row = page.getByRole(AriaRole.DIALOG).locator("tbody tr")
                .filter(new com.microsoft.playwright.Locator.FilterOptions().setHasText(originalName));
        row.getByRole(AriaRole.BUTTON).first().click();

        com.taskmanager.e2e.pages.TaskFormModal modal = new com.taskmanager.e2e.pages.TaskFormModal(page);
        modal.expectOpen(true).waitForPopulatedEdit()
                .fill(new com.taskmanager.e2e.utils.TaskData(updatedName, "Edited by admin", "HIGH", "COMPLETED"));
        modal.submitSave();
        modal.waitClosed();
        assertThat(page.locator("[data-sonner-toast]")
                .filter(new com.microsoft.playwright.Locator.FilterOptions()
                        .setHasText("Task updated successfully"))).isVisible();
        admin.expectUserDetailRow(updatedName);

        var updatedRow = page.getByRole(AriaRole.DIALOG).locator("tbody tr")
                .filter(new com.microsoft.playwright.Locator.FilterOptions().setHasText(updatedName));
        updatedRow.getByRole(AriaRole.BUTTON).nth(1).click();
        var confirm = page.getByRole(AriaRole.DIALOG)
                .filter(new com.microsoft.playwright.Locator.FilterOptions().setHasText("Delete Task")).last();
        confirm.getByRole(AriaRole.BUTTON, new com.microsoft.playwright.Locator.GetByRoleOptions()
                .setName("Delete").setExact(true)).click();
        assertThat(page.locator("[data-sonner-toast]")
                .filter(new com.microsoft.playwright.Locator.FilterOptions()
                        .setHasText("Task deleted"))).isVisible();
        assertThat(page.getByRole(AriaRole.DIALOG).locator("tbody tr")
                .filter(new com.microsoft.playwright.Locator.FilterOptions().setHasText(updatedName))).hasCount(0);
    }

    @Test
    void featureFlagsHideAndRestoreACalendarRoute() {
        loginAsAdmin();
        AdminPage admin = new AdminPage(page).open().openTab("Features");
        boolean originallyEnabled = admin.isFeatureEnabled("Calendar");

        try {
            if (!originallyEnabled) {
                admin.toggleFeature("Calendar");
            }
            admin.toggleFeature("Calendar");
            page.reload();
            assertThat(page.locator("a[href='/home/calendar']")).hasCount(0);

            page.navigate(E2EConfig.baseUrl() + "/home/calendar");
            page.waitForURL(Pattern.compile(".*/home$"));
        } finally {
            page.navigate(E2EConfig.baseUrl() + "/home/admin");
            admin = new AdminPage(page).open().openTab("Features");
            if (!admin.isFeatureEnabled("Calendar")) {
                admin.toggleFeature("Calendar");
            }
        }

        page.reload();
        assertThat(page.locator("a[href='/home/calendar']")).isVisible();
    }

    @Test
    void systemMessageCanBeConfiguredBeforeAndAfterLogin() {
        String message = Unique.value("system message");
        loginAsAdmin();
        AdminPage admin = new AdminPage(page).open().openTab("System Message");
        String originalMessage = admin.systemMessageText();
        boolean originalEnabled = admin.isSystemMessageEnabled();
        boolean originalBefore = admin.showsBeforeLogin();
        boolean originalAfter = admin.showsAfterLogin();

        try {
            admin.setSystemMessage(message, true, true, true);
            new AppShellPage(page).logout();

            SystemMessageModal beforeLogin = new SystemMessageModal(page);
            beforeLogin.expectVisible(message);
            beforeLogin.dismiss();

            new LoginPage(page).open();
            beforeLogin.expectVisible(message);
            beforeLogin.dismiss();
            page.getByLabel("Username").fill(E2EConfig.username());
            page.getByLabel("Password").fill(E2EConfig.password());
            page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in")).click();
            page.waitForURL("**/home");

            SystemMessageModal afterLogin = new SystemMessageModal(page);
            afterLogin.expectVisible(message);
            afterLogin.dismiss();
        } finally {
            if (!page.url().contains("/home")) {
                new LoginPage(page).open();
                new SystemMessageModal(page).waitAndDismiss();
                page.getByLabel("Username").fill(E2EConfig.username());
                page.getByLabel("Password").fill(E2EConfig.password());
                page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in")).click();
                page.waitForURL("**/home");
            }
            new AdminPage(page).open();
            new SystemMessageModal(page).waitAndDismiss();
            new AdminPage(page).openTab("System Message");
            new AdminPage(page).setSystemMessage(originalMessage, originalEnabled, originalBefore, originalAfter);
        }
    }
}
