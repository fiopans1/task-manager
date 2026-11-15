import { useCallback, useEffect, useMemo, useState } from "react";
import taskService from "@/services/taskService";
import teamService from "@/services/teamService";
import { errorToast, successToast } from "@/shared/feedback/Noty";
import { useServerInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";

const EMPTY_ACTION = {
  actionName: "",
  actionDescription: "",
  user: "CurrentUser",
  actionDate: new Date(),
  actionType: "COMMENT",
};

export function useTaskActions({ taskId, teamId, externalRefreshKey = 0 }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [teamMembers, setTeamMembers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newAction, setNewAction] = useState(EMPTY_ACTION);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [saving, setSaving] = useState(false);

  const fetchPage = useCallback(
    async (page, size) => {
      if (!taskId) return { content: [], last: true };
      return taskService.fetchActionsPage(taskId, page, size);
    },
    [taskId],
  );

  const { items, loading, initialLoading, hasMore, sentinelRef } =
    useServerInfiniteScroll(fetchPage, 50, [taskId, refreshKey, externalRefreshKey]);

  useEffect(() => {
    if (!teamId) {
      setTeamMembers([]);
      return;
    }

    teamService
      .getMembersForMention(teamId)
      .then(setTeamMembers)
      .catch(() => setTeamMembers([]));
  }, [teamId]);

  const actions = useMemo(() => {
    let result = [...items];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.actionName?.toLowerCase().includes(query) ||
          item.actionDescription?.toLowerCase().includes(query) ||
          item.user?.toLowerCase().includes(query),
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.actionDate);
      const dateB = new Date(b.actionDate);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [items, searchTerm, sortOrder]);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  const openModal = useCallback(() => {
    setNewAction({ ...EMPTY_ACTION, actionDate: new Date() });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setNewAction({ ...EMPTY_ACTION, actionDate: new Date() });
  }, []);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setNewAction((current) => ({ ...current, [name]: value }));
  }, []);

  const setActionDescription = useCallback((value) => {
    setNewAction((current) => ({ ...current, actionDescription: value }));
  }, []);

  const saveAction = useCallback(async () => {
    if (!newAction.actionName || !newAction.actionDescription) {
      errorToast("Please fill in all required fields");
      return false;
    }

    setSaving(true);
    try {
      await taskService.createActionTask(taskId, {
        ...newAction,
        actionDate: new Date().toISOString(),
      });
      refresh();
      successToast("Action saved successfully");
      closeModal();
      return true;
    } catch (error) {
      errorToast(`Error saving action: ${error.message || error}`);
      return false;
    } finally {
      setSaving(false);
    }
  }, [newAction, taskId, refresh, closeModal]);

  return {
    actions,
    loading,
    initialLoading,
    hasMore,
    sentinelRef,
    teamMembers,
    modalOpen,
    newAction,
    saving,
    searchTerm,
    sortOrder,
    setSearchTerm,
    setSortOrder,
    openModal,
    closeModal,
    handleInputChange,
    setActionDescription,
    saveAction,
    refresh,
  };
}
