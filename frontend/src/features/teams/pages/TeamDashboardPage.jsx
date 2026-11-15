import { useParams } from "react-router-dom";
import {
  Gauge,
  History,
  ListTodo,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  LogOut,
} from "@/shared/lib/icons";
import { PageContainer } from "@/shared/patterns/page-container";
import { PageHeader } from "@/shared/patterns/page-header";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { EmptyState } from "@/shared/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { TeamSummaryPanel } from "@/features/teams/components/dashboard/TeamSummaryPanel";
import DashboardTab from "@/features/teams/components/dashboard/DashboardTab";
import TasksTab from "@/features/teams/components/dashboard/TasksTab";
import HistoryTab from "@/features/teams/components/dashboard/HistoryTab";
import InvitationsTab from "@/features/teams/components/dashboard/InvitationsTab";
import TeamFormDialog from "@/features/teams/components/TeamFormDialog";
import { InviteMemberDialog } from "@/features/teams/components/dialogs/InviteMemberDialog";
import { AddTaskDialog } from "@/features/teams/components/dialogs/AddTaskDialog";
import { ReassignTaskDialog } from "@/features/teams/components/dialogs/ReassignTaskDialog";
import {
  DeleteTeamDialog,
  LeaveTeamDialog,
  RemoveMemberDialog,
} from "@/features/teams/components/dialogs/TeamConfirmDialogs";
import { useTeamDashboard } from "@/features/teams/hooks/useTeamDashboard";

export default function TeamDashboardPage() {
  const { id: teamId } = useParams();
  const page = useTeamDashboard(teamId);

  if (page.loading) {
    return (
      <PageContainer className="flex min-h-[50vh] items-center justify-center">
        <Spinner size={24} label="Loading team" />
      </PageContainer>
    );
  }

  if (!page.team) {
    return (
      <PageContainer>
        <EmptyState
          title="Team not found"
          description="The team may have been deleted or you no longer have access."
          action={<Button onClick={page.goBack}>Back to Teams</Button>}
        />
      </PageContainer>
    );
  }

  const header = (
    <PageHeader
      meta="Workspace / Teams"
      title="Team Details"
      description="Team overview and management."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={page.refreshCurrentTab}
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw size={15} aria-hidden="true" />
          </Button>
          <Button variant="outline" onClick={page.openAddTaskModal}>
            <Plus size={15} aria-hidden="true" />
            Add Task
          </Button>
          {page.isAdmin ? (
            <>
              <Button variant="outline" onClick={() => page.openModal("invite")}>
                <UserPlus size={15} aria-hidden="true" />
                Invite
              </Button>
              <Button variant="outline" onClick={() => page.openModal("editTeam")}>
                <Pencil size={15} aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => page.openModal("deleteTeam")}
                className="text-danger hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 size={15} aria-hidden="true" />
                Delete
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => page.openModal("leave")}
              className="text-danger hover:bg-danger-soft hover:text-danger"
            >
              <LogOut size={15} aria-hidden="true" />
              Leave
            </Button>
          )}
        </div>
      }
    />
  );

  return (
    <PageContainer>
      <div className="space-y-6">
        {header}

        <TeamSummaryPanel
          team={page.team}
          memberCount={page.memberCount}
          isAdmin={page.isAdmin}
          totalTasks={page.dashboard?.totalTasks ?? 0}
          completionPercent={page.completionPercent}
          showMore={page.showMore}
          onToggleShowMore={() => page.setShowMore((current) => !current)}
        />

        <Tabs value={page.activeTab} onValueChange={page.setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard">
              <Gauge size={14} aria-hidden="true" className="hidden sm:block" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <ListTodo size={14} aria-hidden="true" className="hidden sm:block" />
              Tasks
            </TabsTrigger>
            {page.isAdmin ? (
              <TabsTrigger value="history">
                <History size={14} aria-hidden="true" className="hidden sm:block" />
                History
              </TabsTrigger>
            ) : null}
            {page.isAdmin ? (
              <TabsTrigger value="invitations">
                <Mail size={14} aria-hidden="true" className="hidden sm:block" />
                Invitations
              </TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab
              dashboard={page.dashboard}
              team={page.team}
              isAdmin={page.isAdmin}
              maxPending={page.maxPending}
              onRoleChange={page.handleRoleChange}
              onRemoveMember={page.openRemoveModal}
            />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksTab
              teamId={teamId}
              team={page.team}
              isAdmin={page.isAdmin}
              filterMember={page.filterMember}
              filterState={page.filterState}
              filterPriority={page.filterPriority}
              onFilterMemberChange={page.setFilterMember}
              onFilterStateChange={page.setFilterState}
              onFilterPriorityChange={page.setFilterPriority}
              onClearFilters={page.clearFilters}
              onReassign={page.openReassignModal}
              onNavigateToTask={page.goToTask}
              refreshKey={page.tasksRefreshKey}
            />
          </TabsContent>

          {page.isAdmin ? (
            <TabsContent value="history">
              <HistoryTab teamId={teamId} refreshKey={page.historyRefreshKey} />
            </TabsContent>
          ) : null}

          {page.isAdmin ? (
            <TabsContent value="invitations">
              <InvitationsTab
                invitations={page.invitations}
                onCancelInvitation={page.handleCancelInvitation}
              />
            </TabsContent>
          ) : null}
        </Tabs>
      </div>

      <InviteMemberDialog
        open={page.modals.invite}
        onOpenChange={(open) => {
          if (open) page.openModal("invite");
          else {
            page.closeModal("invite");
            page.setInviteValidated(false);
          }
        }}
        username={page.inviteUsername}
        setUsername={page.setInviteUsername}
        validated={page.inviteValidated}
        onSubmit={page.handleInvite}
        pending={page.pending}
      />

      <AddTaskDialog
        open={page.modals.addTask}
        onOpenChange={(open) => {
          if (open) page.openAddTaskModal();
          else {
            page.closeModal("addTask");
            page.setAddTaskValidated(false);
          }
        }}
        tasks={page.userTasks}
        selectedTaskId={page.selectedTaskId}
        setSelectedTaskId={page.setSelectedTaskId}
        validated={page.addTaskValidated}
        onSubmit={page.handleAddTask}
        pending={page.pending}
      />

      <ReassignTaskDialog
        open={page.modals.reassign}
        onOpenChange={(open) => {
          if (open) page.openModal("reassign");
          else {
            page.closeModal("reassign");
            page.setReassignValidated(false);
          }
        }}
        task={page.reassignTask}
        team={page.team}
        target={page.reassignTarget}
        setTarget={page.setReassignTarget}
        validated={page.reassignValidated}
        onSubmit={page.handleReassign}
        pending={page.pending}
      />

      <RemoveMemberDialog
        open={page.modals.remove}
        onOpenChange={(open) => {
          if (open) page.openModal("remove");
          else {
            page.closeModal("remove");
            page.setMemberToRemove?.(null);
          }
        }}
        member={page.memberToRemove}
        onConfirm={page.handleRemoveMember}
        loading={page.pending}
      />

      <DeleteTeamDialog
        open={page.modals.deleteTeam}
        onOpenChange={(open) => {
          if (open) page.openModal("deleteTeam");
          else page.closeModal("deleteTeam");
        }}
        team={page.team}
        onConfirm={page.handleDeleteTeam}
        loading={page.pending}
      />

      <LeaveTeamDialog
        open={page.modals.leave}
        onOpenChange={(open) => {
          if (open) page.openModal("leave");
          else page.closeModal("leave");
        }}
        team={page.team}
        onConfirm={page.handleLeaveTeam}
        loading={page.pending}
      />

      <TeamFormDialog
        open={page.modals.editTeam}
        onOpenChange={(open) => {
          if (open) page.openModal("editTeam");
          else page.closeModal("editTeam");
        }}
        mode="edit"
        initialData={page.team}
        onSave={page.handleEditTeamSave}
        onSaved={page.refreshCurrentTab}
      />
    </PageContainer>
  );
}
