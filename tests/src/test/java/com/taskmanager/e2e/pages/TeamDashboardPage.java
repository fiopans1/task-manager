package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.microsoft.playwright.options.SelectOption;

import java.util.regex.Pattern;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class TeamDashboardPage extends BasePage {

    public TeamDashboardPage(Page page) {
        super(page);
    }

    public TeamDashboardPage expectOpen(String teamName) {
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Team Details"))).isVisible();
        assertThat(page.locator(".card-header h3").first()).hasText(teamName);
        return this;
    }

    public void openTab(String name) {
        page.getByRole(AriaRole.TAB, new Page.GetByRoleOptions()
                .setName(name)).click();
    }

    public void addTask(String taskName) {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions()
                .setName(Pattern.compile(".*Add Task.*"))).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Add Task to Team"));
        dialog.locator("select").selectOption(new SelectOption().setLabel(taskName));
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Add to Team")).click();
        assertThat(toast("Task added to team")).isVisible();
    }

    public void invite(String username) {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions()
                .setName(Pattern.compile(".*Invite.*"))).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Invite Member"));
        dialog.getByPlaceholder("Enter username to invite").fill(username);
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Send Invitation")).click();
        assertThat(toast("Invitation sent to " + username)).isVisible();
    }

    public void expectMember(String username) {
        Locator row = memberRow(username);
        assertThat(row).isVisible();
    }

    public void expectNoMember(String username) {
        assertThat(memberRow(username)).hasCount(0);
    }

    public void promote(String username) {
        memberRow(username).getByRole(AriaRole.BUTTON,
                new Locator.GetByRoleOptions().setName("Promote")).click();
        assertThat(toast("Role updated")).isVisible();
        assertThat(memberRow(username)).containsText("Admin");
    }

    public void demote(String username) {
        memberRow(username).getByRole(AriaRole.BUTTON,
                new Locator.GetByRoleOptions().setName("Demote")).click();
        assertThat(toast("Role updated")).isVisible();
        assertThat(memberRow(username)).containsText("Member");
    }

    public void reassignTask(String taskName, String username) {
        Locator task = taskRow(taskName);
        task.getByTitle("Reassign task").click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Reassign Task"));
        dialog.locator("select").selectOption(new SelectOption().setLabel(username + " (Member)"));
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Reassign")).click();
        assertThat(toast("reassigned to " + username)).isVisible();
    }

    public void expectTask(String name) {
        assertThat(taskRow(name)).isVisible();
    }

    public void filterTasks(String member, String state, String priority) {
        Locator selects = page.locator(".tab-pane.active select");
        selects.nth(0).selectOption(member);
        selects.nth(1).selectOption(state);
        selects.nth(2).selectOption(priority);
    }

    public void clearTaskFilters() {
        page.locator(".tab-pane.active").getByRole(AriaRole.BUTTON,
                new Locator.GetByRoleOptions().setName("Clear")).click();
    }

    public void expectNoTasks() {
        assertThat(page.locator(".tab-pane.active")
                .getByText(java.util.regex.Pattern.compile("No tasks found"))).isVisible();
    }

    public void expectHistoryEntry(String taskName, String username) {
        Locator history = page.locator(".tab-pane.active .list-group-item")
                .filter(new Locator.FilterOptions().setHasText(taskName))
                .filter(new Locator.FilterOptions().setHasText(username));
        assertThat(history.first()).isVisible();
    }

    public void cancelInvitation(String username) {
        Locator row = page.locator(".tab-pane.active .list-group-item")
                .filter(new Locator.FilterOptions().setHasText(username))
                .first();
        row.getByTitle("Cancel invitation").click();
        assertThat(toast("Invitation cancelled")).isVisible();
    }

    public void cancelAllInvitations(String username) {
        for (int attempt = 0; attempt < 10; attempt++) {
            Locator rows = page.locator(".tab-pane.active .list-group-item")
                    .filter(new Locator.FilterOptions().setHasText(username));
            if (rows.count() == 0) {
                return;
            }
            cancelInvitation(username);
        }
    }

    public void expectPendingInvitation(String username) {
        assertThat(page.locator(".tab-pane.active .list-group-item")
                .filter(new Locator.FilterOptions().setHasText(username))
                .first()).isVisible();
    }

    public void removeMember(String username) {
        Locator row = memberRow(username);
        row.locator("button.btn-outline-danger").click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Remove Member"));
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Remove")).click();
        assertThat(toast("Member removed")).isVisible();
        expectNoMember(username);
    }

    public void leaveTeam() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions()
                .setName(Pattern.compile(".*Leave.*"))).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Leave Team"));
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Leave Team")).click();
        page.waitForURL("**/home/teams");
        assertThat(toast("You left the team")).isVisible();
    }

    public void deleteTeam() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions()
                .setName(Pattern.compile(".*Delete.*"))).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Delete Team"));
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Delete Team")).click();
        page.waitForURL("**/home/teams");
        assertThat(toast("Team deleted successfully")).isVisible();
    }

    public boolean hasInviteControl() {
        return page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions()
                .setName(Pattern.compile(".*Invite.*"))).count() > 0;
    }

    public boolean hasHistoryTab() {
        return page.getByRole(AriaRole.TAB, new Page.GetByRoleOptions()
                .setName("History")).count() > 0;
    }

    private Locator memberRow(String username) {
        return page.locator(".tab-pane.active .list-group-item")
                .filter(new Locator.FilterOptions().setHasText(username))
                .first();
    }

    private Locator taskRow(String name) {
        return page.locator(".card").filter(new Locator.FilterOptions().setHasText(name));
    }
}
