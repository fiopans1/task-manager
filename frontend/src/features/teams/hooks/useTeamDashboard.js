import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import teamService from "@/services/teamService";
import taskService from "@/services/taskService";
import { errorToast, promiseToast } from "@/shared/feedback/Noty";

const INITIAL_MODALS = {
  invite: false,
  addTask: false,
  reassign: false,
  remove: false,
  deleteTeam: false,
  editTeam: false,
  leave: false,
};

export function useTeamDashboard(teamId) {
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMore, setShowMore] = useState(false);
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [filterMember, setFilterMember] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const [modals, setModals] = useState(INITIAL_MODALS);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteValidated, setInviteValidated] = useState(false);
  const [userTasks, setUserTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [addTaskValidated, setAddTaskValidated] = useState(false);
  const [reassignTask, setReassignTask] = useState(null);
  const [reassignTarget, setReassignTarget] = useState("");
  const [reassignValidated, setReassignValidated] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [pending, setPending] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [teamData, dashboardData, adminCheck] = await Promise.all([
        teamService.getTeamById(teamId),
        teamService.getTeamDashboard(teamId),
        teamService.isCurrentUserAdmin(teamId),
      ]);
      setTeam(teamData);
      setDashboard(dashboardData);
      setIsAdmin(adminCheck);
    } catch {
      errorToast("Error loading team data");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const loadInvitations = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const data = await teamService.getTeamInvitations(teamId);
      setInvitations(data);
    } catch {
      // Only admins can see invitations.
    }
  }, [teamId, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === "invitations") loadInvitations();
  }, [activeTab, loadInvitations]);

  const openModal = (name) => setModals((current) => ({ ...current, [name]: true }));
  const closeModal = (name) => setModals((current) => ({ ...current, [name]: false }));

  const refreshCurrentTab = useCallback(() => {
    loadData();
    if (activeTab === "tasks") setTasksRefreshKey((key) => key + 1);
    if (activeTab === "history") setHistoryRefreshKey((key) => key + 1);
    if (activeTab === "invitations") loadInvitations();
  }, [activeTab, loadData, loadInvitations]);

  const handleInvite = async (event) => {
    event.preventDefault();
    setInviteValidated(true);
    if (!inviteUsername || inviteUsername.trim() === "") return false;

    setPending(true);
    try {
      await promiseToast(teamService.createInvitation(teamId, inviteUsername), {
        loading: "Sending invitation...",
        success: `Invitation sent to ${inviteUsername}`,
        error: (requestError) =>
          requestError?.response?.data?.message || "Error sending invitation",
      });
      closeModal("invite");
      setInviteUsername("");
      setInviteValidated(false);
      if (activeTab === "invitations") loadInvitations();
      return true;
    } catch {
      return false;
    } finally {
      setPending(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setPending(true);
    try {
      await promiseToast(teamService.removeMember(teamId, memberToRemove.id), {
        loading: "Removing member...",
        success: "Member removed",
        error: () => "Error removing member",
      });
      closeModal("remove");
      setMemberToRemove(null);
      loadData();
    } catch {
      errorToast("Error removing member");
    } finally {
      setPending(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await promiseToast(teamService.updateMemberRole(teamId, memberId, newRole), {
        loading: "Updating role...",
        success: "Role updated",
        error: () => "Error updating role",
      });
      loadData();
    } catch {
      errorToast("Error updating role");
    }
  };

  const handleAddTask = async (event) => {
    event.preventDefault();
    setAddTaskValidated(true);
    if (!selectedTaskId) return false;

    setPending(true);
    try {
      await promiseToast(teamService.addTaskToTeam(teamId, selectedTaskId), {
        loading: "Adding task to team...",
        success: "Task added to team",
        error: () => "Error adding task to team",
      });
      closeModal("addTask");
      setSelectedTaskId("");
      setAddTaskValidated(false);
      loadData();
      setTasksRefreshKey((key) => key + 1);
      return true;
    } catch {
      errorToast("Error adding task to team");
      return false;
    } finally {
      setPending(false);
    }
  };

  const handleReassign = async (event) => {
    event.preventDefault();
    setReassignValidated(true);
    if (!reassignTask || !reassignTarget) return false;

    setPending(true);
    try {
      await promiseToast(
        teamService.assignTask(teamId, reassignTask.id, reassignTarget),
        {
          loading: "Reassigning task...",
          success: `Task "${reassignTask.nameOfTask}" reassigned to ${reassignTarget}`,
          error: () => "Error reassigning task",
        },
      );
      closeModal("reassign");
      setReassignTask(null);
      setReassignTarget("");
      setReassignValidated(false);
      loadData();
      setTasksRefreshKey((key) => key + 1);
      return true;
    } catch {
      errorToast("Error reassigning task");
      return false;
    } finally {
      setPending(false);
    }
  };

  const loadUserTasks = async () => {
    try {
      const allTasks = await taskService.getAllTasks();
      setUserTasks(allTasks.filter((task) => !task.teamId));
    } catch {
      setUserTasks([]);
    }
  };

  const openAddTaskModal = () => {
    openModal("addTask");
    loadUserTasks();
  };

  const openReassignModal = (task) => {
    setReassignTask(task);
    setReassignTarget("");
    openModal("reassign");
  };

  const openRemoveModal = (member) => {
    setMemberToRemove(member);
    openModal("remove");
  };

  const handleDeleteTeam = async () => {
    setPending(true);
    try {
      await promiseToast(teamService.deleteTeam(teamId), {
        loading: "Deleting team...",
        success: "Team deleted successfully",
        error: () => "Error deleting team",
      });
      navigate("/home/teams");
    } catch {
      errorToast("Error deleting team");
    } finally {
      setPending(false);
    }
  };

  const handleEditTeamSave = async (formData) => {
    await teamService.updateTeam(teamId, formData);
    closeModal("editTeam");
    loadData();
  };

  const handleLeaveTeam = async () => {
    setPending(true);
    try {
      await promiseToast(teamService.leaveTeam(teamId), {
        loading: "Leaving team...",
        success: "You left the team",
        error: (requestError) =>
          requestError?.response?.data?.message || "Error leaving team",
      });
      navigate("/home/teams");
    } catch {
      // Toast already shown.
    } finally {
      setPending(false);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      await promiseToast(teamService.cancelInvitation(teamId, invitationId), {
        loading: "Cancelling invitation...",
        success: "Invitation cancelled",
        error: () => "Error cancelling invitation",
      });
      loadInvitations();
    } catch {
      errorToast("Error cancelling invitation");
    }
  };

  const maxPending = dashboard?.members
    ? Math.max(...dashboard.members.map((member) => member.pendingTasks), 1)
    : 1;

  const memberCount = team?.members ? team.members.length : 0;
  const completionPercent =
    dashboard && dashboard.totalTasks > 0
      ? Math.round((dashboard.completedTasks / dashboard.totalTasks) * 100)
      : 0;

  return {
    team,
    dashboard,
    invitations,
    loading,
    isAdmin,
    activeTab,
    setActiveTab,
    showMore,
    setShowMore,
    tasksRefreshKey,
    historyRefreshKey,
    filterMember,
    filterState,
    filterPriority,
    setFilterMember,
    setFilterState,
    setFilterPriority,
    clearFilters: () => {
      setFilterMember("");
      setFilterState("");
      setFilterPriority("");
    },
    modals,
    openModal,
    closeModal,
    openAddTaskModal,
    openReassignModal,
    openRemoveModal,
    inviteUsername,
    setInviteUsername,
    inviteValidated,
    setInviteValidated,
    userTasks,
    selectedTaskId,
    setSelectedTaskId,
    addTaskValidated,
    setAddTaskValidated,
    reassignTask,
    reassignTarget,
    setReassignTarget,
    reassignValidated,
    setReassignValidated,
    memberToRemove,
    setMemberToRemove,
    pending,
    handleInvite,
    handleRemoveMember,
    handleRoleChange,
    handleAddTask,
    handleReassign,
    handleDeleteTeam,
    handleEditTeamSave,
    handleLeaveTeam,
    handleCancelInvitation,
    refreshCurrentTab,
    maxPending,
    memberCount,
    completionPercent,
    goBack: () => navigate("/home/teams"),
    goToTask: (taskId) => navigate(`/home/tasks/${taskId}`),
  };
}
