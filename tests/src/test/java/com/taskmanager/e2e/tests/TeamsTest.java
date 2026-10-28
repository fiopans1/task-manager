package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.config.E2EConfig;
import com.taskmanager.e2e.core.BaseTest;
import com.taskmanager.e2e.pages.TeamDashboardPage;
import com.taskmanager.e2e.pages.TeamsPage;
import com.taskmanager.e2e.pages.TasksPage;
import com.taskmanager.e2e.utils.TaskData;
import com.taskmanager.e2e.utils.TeamData;
import com.taskmanager.e2e.utils.Unique;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

@Tag("smoke")
class TeamsTest extends BaseTest {

    @Test
    void createSearchEditAndDeleteTeam() {
        loginAsAdmin();
        String name = Unique.value("team");
        String updatedName = Unique.value("team edited");
        TeamsPage teams = new TeamsPage(page).open();

        teams.createTeam(TeamData.simple(name));
        teams.search(name);
        assertThat(teams.card(name)).isVisible();
        teams.clearSearch();

        teams.editTeam(name, new TeamData(updatedName, "Updated team description"));
        teams.deleteTeam(updatedName);
        teams.expectNoTeam(updatedName);
    }

    @Test
    void invitationRolesReassignmentHistoryAndMemberRemoval() {
        loginAsAdmin();
        String teamName = Unique.value("team collaboration");
        String taskName = Unique.value("team task");
        String collaborator = E2EConfig.collaboratorUsername();

        new TasksPage(page).open().createTask(TaskData.event(taskName, "Team task"));
        TeamsPage teams = new TeamsPage(page).open();
        teams.createTeam(TeamData.simple(teamName));
        teams.openTeam(teamName);

        TeamDashboardPage dashboard = new TeamDashboardPage(page).expectOpen(teamName);
        dashboard.addTask(taskName);
        dashboard.invite(collaborator);

        Page basic = loginAsCollaborator();
        TeamsPage basicTeams = new TeamsPage(basic).open();
        basicTeams.acceptInvitation(teamName);

        page.reload();
        dashboard.expectOpen(teamName);
        dashboard.expectMember(collaborator);
        dashboard.promote(collaborator);
        dashboard.demote(collaborator);

        dashboard.openTab("Tasks");
        dashboard.expectTask(taskName);
        dashboard.reassignTask(taskName, collaborator);

        page.reload();
        dashboard = new TeamDashboardPage(page).expectOpen(teamName);
        dashboard.openTab("History");
        dashboard.expectHistoryEntry(taskName, collaborator);

        dashboard.openTab("Dashboard");
        dashboard.removeMember(collaborator);
        dashboard.expectNoMember(collaborator);

        dashboard.deleteTeam();
        new TasksPage(basic).open().expectTask(taskName);
        new TasksPage(basic).open().deleteTask(taskName);
    }

    @Test
    void cancelInvitationAndLeaveTeam() {
        loginAsAdmin();
        String teamName = Unique.value("team leave");
        String collaborator = E2EConfig.collaboratorUsername();

        TeamsPage teams = new TeamsPage(page).open();
        teams.createTeam(TeamData.simple(teamName));
        teams.openTeam(teamName);
        TeamDashboardPage dashboard = new TeamDashboardPage(page).expectOpen(teamName);
        dashboard.invite(collaborator);

        dashboard.openTab("Invitations");
        dashboard.expectPendingInvitation(collaborator);
        dashboard.cancelAllInvitations(collaborator);

        Page basic = loginAsCollaborator();
        TeamsPage basicTeams = new TeamsPage(basic).open();
        org.junit.jupiter.api.Assertions.assertFalse(basicTeams.hasPendingInvitation(teamName));

        dashboard.invite(collaborator);
        basic.reload();
        basicTeams = new TeamsPage(basic).open();
        basicTeams.acceptInvitation(teamName);
        basicTeams.openTeam(teamName);
        new TeamDashboardPage(basic).expectOpen(teamName).leaveTeam();
        assertThat(basic).hasURL(java.util.regex.Pattern.compile(".*/home/teams"));

        dashboard.deleteTeam();
    }

    @Test
    void teamTasksCanBeFilteredByMemberStateAndPriority() {
        loginAsAdmin();
        String teamName = Unique.value("team filters");
        String taskName = Unique.value("team filter task");

        new TasksPage(page).open().createTask(new TaskData(taskName, "Filter task", "HIGH", "IN_PROGRESS"));
        TeamsPage teams = new TeamsPage(page).open();
        teams.createTeam(TeamData.simple(teamName));
        teams.openTeam(teamName);
        TeamDashboardPage dashboard = new TeamDashboardPage(page).expectOpen(teamName);
        dashboard.addTask(taskName);
        page.reload();
        dashboard = new TeamDashboardPage(page).expectOpen(teamName);
        dashboard.openTab("Tasks");
        dashboard.expectTask(taskName);

        dashboard.filterTasks("", "COMPLETED", "");
        dashboard.expectNoTasks();
        dashboard.clearTaskFilters();
        dashboard.expectTask(taskName);

        dashboard.filterTasks(E2EConfig.username(), "", "");
        dashboard.expectTask(taskName);
        dashboard.clearTaskFilters();

        dashboard.filterTasks("", "IN_PROGRESS", "HIGH");
        dashboard.expectTask(taskName);

        dashboard.openTab("Dashboard");
        dashboard.deleteTeam();
        new TasksPage(page).open().deleteTask(taskName);
    }

    @Test
    void basicMemberCannotSeeAdminTeamControls() {
        loginAsAdmin();
        String teamName = Unique.value("team permissions");
        String collaborator = E2EConfig.collaboratorUsername();

        TeamsPage teams = new TeamsPage(page).open();
        teams.createTeam(TeamData.simple(teamName));
        teams.openTeam(teamName);
        new TeamDashboardPage(page).expectOpen(teamName).invite(collaborator);

        Page basic = loginAsCollaborator();
        new TeamsPage(basic).open().acceptInvitation(teamName);
        new TeamsPage(basic).openTeam(teamName);
        TeamDashboardPage basicDashboard = new TeamDashboardPage(basic).expectOpen(teamName);
        assertThat(basic.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions()
                .setName(java.util.regex.Pattern.compile(".*Invite.*")))).hasCount(0);
        org.junit.jupiter.api.Assertions.assertFalse(basicDashboard.hasHistoryTab());

        dashboardDeleteTeam(page, teamName);
    }

    private void dashboardDeleteTeam(Page adminPage, String teamName) {
        new TeamsPage(adminPage).open().openTeam(teamName);
        new TeamDashboardPage(adminPage).expectOpen(teamName).deleteTeam();
    }
}
