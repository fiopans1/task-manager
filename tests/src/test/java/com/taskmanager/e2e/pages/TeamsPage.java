package com.taskmanager.e2e.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.utils.TeamData;

import java.util.regex.Pattern;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class TeamsPage extends BasePage {

    public TeamsPage(Page page) {
        super(page);
    }

    public TeamsPage open() {
        open("/home/teams");
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Teams"))).isVisible();
        return this;
    }

    public TeamFormModal newTeam() {
        byRoleButton(Pattern.compile(".*New Team")).click();
        TeamFormModal modal = new TeamFormModal(page);
        modal.expectOpen(false);
        return modal;
    }

    public void createTeam(TeamData data) {
        TeamFormModal modal = newTeam().fill(data);
        modal.submitCreate();
        modal.waitClosed();
        assertThat(toast("Team created successfully")).isVisible();
        expectTeam(data.name());
    }

    public Locator card(String name) {
        return page.locator(".item-card").filter(new Locator.FilterOptions().setHasText(name));
    }

    public void expectTeam(String name) {
        assertThat(card(name)).isVisible();
    }

    public void expectNoTeam(String name) {
        assertThat(page.getByText(name, new Page.GetByTextOptions().setExact(true))).hasCount(0);
    }

    public void search(String text) {
        page.getByPlaceholder("Search teams").fill(text);
        byRoleButton("Search").click();
    }

    public void clearSearch() {
        byRoleButton("Clear").click();
    }

    public void openTeam(String name) {
        card(name).getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName(Pattern.compile(".*Open team.*"))).click();
        page.waitForURL("**/home/teams/*");
    }

    public void editTeam(String name, TeamData updated) {
        card(name).getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName(Pattern.compile(".*Edit.*"))).click();
        TeamFormModal modal = new TeamFormModal(page);
        modal.expectOpen(true).waitForPopulatedEdit().fill(updated);
        modal.submitUpdate();
        modal.waitClosed();
        assertThat(toast("Team updated successfully")).isVisible();
        expectTeam(updated.name());
    }

    public void deleteTeam(String name) {
        card(name).getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName(Pattern.compile(".*Delete.*"))).click();
        Locator dialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Confirm deletion"));
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Delete Team")).click();
        assertThat(toast("Team deleted successfully")).isVisible();
        expectNoTeam(name);
    }

    public void acceptInvitation(String teamName) {
        invitationRow(teamName).first().getByRole(AriaRole.BUTTON,
                new Locator.GetByRoleOptions().setName("Accept")).click();
        assertThat(toast("Invitation accepted")).isVisible();
        expectTeam(teamName);
    }

    public void rejectInvitation(String teamName) {
        invitationRow(teamName).first().getByRole(AriaRole.BUTTON,
                new Locator.GetByRoleOptions().setName("Reject")).click();
        assertThat(toast("Invitation rejected")).isVisible();
        assertThat(invitationRow(teamName)).hasCount(0);
    }

    public boolean hasPendingInvitation(String teamName) {
        return invitationRow(teamName).count() > 0;
    }

    private Locator invitationRow(String teamName) {
        return page.locator("div.border.rounded-4")
                .filter(new Locator.FilterOptions().setHasText(teamName));
    }
}
