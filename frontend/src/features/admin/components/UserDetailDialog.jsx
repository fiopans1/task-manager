import { useEffect, useState } from "react";
import taskService from "@/services/taskService";
import listService from "@/services/listService";
import teamService from "@/services/teamService";
import { errorToast, successToast } from "@/shared/feedback/Noty";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { Avatar } from "@/shared/ui/avatar";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { TaskFormDialog } from "@/features/tasks";
import { ListFormDialog } from "@/features/lists";
import { TeamFormDialog } from "@/features/teams";
import { UserTasksTab } from "@/features/admin/components/user-detail/UserTasksTab";
import { UserListsTab } from "@/features/admin/components/user-detail/UserListsTab";
import { UserTeamsTab } from "@/features/admin/components/user-detail/UserTeamsTab";
import { formatDate } from "@/shared/lib/formatDate";

const INITIAL_CONFIRM = { open: false };

export default function UserDetailDialog({ open, onOpenChange, user }) {
  const [detailTab, setDetailTab] = useState("tasks");
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);
  const [listsRefreshKey, setListsRefreshKey] = useState(0);
  const [teamsRefreshKey, setTeamsRefreshKey] = useState(0);

  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [editTaskData, setEditTaskData] = useState({});
  const [editListOpen, setEditListOpen] = useState(false);
  const [editListData, setEditListData] = useState({});
  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [editTeamData, setEditTeamData] = useState({});
  const [confirm, setConfirm] = useState(INITIAL_CONFIRM);

  useEffect(() => {
    if (open && user) {
      setDetailTab("tasks");
      setTasksRefreshKey((key) => key + 1);
      setListsRefreshKey((key) => key + 1);
      setTeamsRefreshKey((key) => key + 1);
    }
  }, [open, user]);

  if (!user) return null;

  const handleEditTask = async (task) => {
    try {
      const fullTask = await taskService.getTaskById(task.id);
      setEditTaskData(fullTask);
      setEditTaskOpen(true);
    } catch {
      errorToast("Error loading task details");
    }
  };

  const handleDeleteTask = (taskId) => {
    setConfirm({
      open: true,
      title: "Delete task",
      description:
        "Are you sure you want to delete this task? This action cannot be undone.",
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          await taskService.deleteTask(taskId);
          setTasksRefreshKey((key) => key + 1);
          successToast("Task deleted");
        } catch {
          errorToast("Error deleting task");
        }
        setConfirm(INITIAL_CONFIRM);
      },
    });
  };

  const handleDeleteList = (listId) => {
    setConfirm({
      open: true,
      title: "Delete List",
      description:
        "Are you sure you want to delete this list? Tasks in the list will be unlinked, not deleted.",
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          await listService.deleteList(listId);
          setListsRefreshKey((key) => key + 1);
          successToast("List deleted");
        } catch {
          errorToast("Error deleting list");
        }
        setConfirm(INITIAL_CONFIRM);
      },
    });
  };

  const handleDeleteTeam = (teamId) => {
    setConfirm({
      open: true,
      title: "Delete Team",
      description:
        "Are you sure you want to delete this team? All members will be removed.",
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          await teamService.deleteTeam(teamId);
          setTeamsRefreshKey((key) => key + 1);
          successToast("Team deleted");
        } catch {
          errorToast("Error deleting team");
        }
        setConfirm(INITIAL_CONFIRM);
      },
    });
  };

  const handleSaveTeam = async (formData) => {
    await teamService.updateTeam(editTeamData.id, formData);
    setTeamsRefreshKey((key) => key + 1);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Avatar name={user.username} size="md" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle>{user.username}</DialogTitle>
                  {user.blocked ? <Badge tone="danger">Blocked</Badge> : null}
                </div>
                <DialogDescription>{user.email}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-border bg-surface-2 px-4 py-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                Roles
                {user.roles?.length ? (
                  user.roles.map((role) => (
                    <Badge key={role} tone={role.includes("ADMIN") ? "danger" : "brand"}>
                      {role}
                    </Badge>
                  ))
                ) : (
                  <span className="text-foreground">—</span>
                )}
              </span>
              <span>
                Created{" "}
                <span className="font-mono text-foreground">
                  {user.creationDate ? formatDate(user.creationDate) : "—"}
                </span>
              </span>
            </div>

            <Tabs value={detailTab} onValueChange={setDetailTab}>
              <TabsList>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="lists">Lists</TabsTrigger>
                <TabsTrigger value="teams">Teams</TabsTrigger>
              </TabsList>

              <TabsContent value="tasks">
                <UserTasksTab
                  userId={user.id}
                  refreshKey={tasksRefreshKey}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              </TabsContent>

              <TabsContent value="lists">
                <UserListsTab
                  userId={user.id}
                  refreshKey={listsRefreshKey}
                  onEditList={(list) => {
                    setEditListData(list);
                    setEditListOpen(true);
                  }}
                  onDeleteList={handleDeleteList}
                />
              </TabsContent>

              <TabsContent value="teams">
                <UserTeamsTab
                  userId={user.id}
                  refreshKey={teamsRefreshKey}
                  onEditTeam={(team) => {
                    setEditTeamData(team);
                    setEditTeamOpen(true);
                  }}
                  onDeleteTeam={handleDeleteTeam}
                />
              </TabsContent>
            </Tabs>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <TaskFormDialog
        open={editTaskOpen}
        onOpenChange={setEditTaskOpen}
        mode="edit"
        initialData={editTaskData}
        onSaved={() => setTasksRefreshKey((key) => key + 1)}
      />

      <ListFormDialog
        open={editListOpen}
        onOpenChange={setEditListOpen}
        mode="edit"
        initialData={editListData}
        onSaved={() => setListsRefreshKey((key) => key + 1)}
      />

      <TeamFormDialog
        open={editTeamOpen}
        onOpenChange={setEditTeamOpen}
        mode="edit"
        initialData={editTeamData}
        onSave={handleSaveTeam}
        onSaved={() => setTeamsRefreshKey((key) => key + 1)}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setConfirm(INITIAL_CONFIRM);
        }}
        title={confirm.title}
        description={confirm.description}
        confirmLabel={confirm.confirmLabel}
        onConfirm={confirm.onConfirm}
      />
    </>
  );
}
