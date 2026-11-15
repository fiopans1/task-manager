import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import listService from "@/services/listService";
import taskService from "@/services/taskService";
import { errorToast, promiseToast } from "@/shared/feedback/Noty";
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";

export function useListDetails(listId) {
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [searchAvailable, setSearchAvailable] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchList = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedList = await listService.getListById(listId);
        if (cancelled) return;
        setList(fetchedList);
        setTasks(fetchedList.tasks || []);
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
          errorToast(`Error when trying to load the list details: ${requestError.message}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (listId) fetchList();

    return () => {
      cancelled = true;
    };
  }, [listId, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.state === "COMPLETED").length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const { displayedItems: paginatedTasks, sentinelRef, hasMore } = useInfiniteScroll(tasks);

  const openAddModal = useCallback(async () => {
    setAddOpen(true);
    setSelectedTaskIds([]);
    setSearchAvailable("");
    setLoadingAvailable(true);

    try {
      const unassignedTasks = await taskService.getTasksWithoutList();
      setAvailableTasks(unassignedTasks);
    } catch (requestError) {
      errorToast(`Error loading tasks: ${requestError.message}`);
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  const toggleTaskSelection = useCallback((taskId) => {
    setSelectedTaskIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId],
    );
  }, []);

  const addTasks = useCallback(async () => {
    if (selectedTaskIds.length === 0) return false;

    setPending(true);
    try {
      await promiseToast(listService.addTasksToList(listId, selectedTaskIds), {
        loading: "Adding tasks to list...",
        success: "Tasks added successfully",
        error: (requestError) => `Error: ${requestError?.message || requestError}`,
      });
      refresh();
      setAddOpen(false);
      return true;
    } catch {
      return false;
    } finally {
      setPending(false);
    }
  }, [listId, selectedTaskIds, refresh]);

  const removeTask = useCallback(
    async (taskId) => {
      setPending(true);
      try {
        await promiseToast(listService.deleteTaskFromList(taskId), {
          loading: "Removing task from list...",
          success: "Task removed from list",
          error: (requestError) => `Error: ${requestError?.message || requestError}`,
        });
        refresh();
      } catch {
        // Toast already shown.
      } finally {
        setPending(false);
      }
    },
    [refresh],
  );

  const deleteList = useCallback(async () => {
    setPending(true);
    try {
      await promiseToast(listService.deleteList(listId), {
        loading: "Deleting list...",
        success: "List deleted successfully",
        error: (requestError) => `Error: ${requestError?.message || requestError}`,
      });
      setDeleteOpen(false);
      navigate("/home/lists");
    } catch {
      // Toast already shown.
    } finally {
      setPending(false);
    }
  }, [listId, navigate]);

  const filteredAvailableTasks = useMemo(
    () =>
      availableTasks.filter((task) =>
        task.nameOfTask.toLowerCase().includes(searchAvailable.toLowerCase()),
      ),
    [availableTasks, searchAvailable],
  );

  return {
    list,
    tasks,
    paginatedTasks,
    sentinelRef,
    hasMore,
    loading,
    error,
    pending,
    showMore,
    setShowMore,
    editOpen,
    setEditOpen,
    deleteOpen,
    setDeleteOpen,
    addOpen,
    setAddOpen,
    availableTasks,
    filteredAvailableTasks,
    selectedTaskIds,
    loadingAvailable,
    searchAvailable,
    setSearchAvailable,
    openAddModal,
    toggleTaskSelection,
    addTasks,
    removeTask,
    deleteList,
    refresh,
    totalTasks,
    completedTasks,
    progressPercentage,
    goToTask: (taskId) => navigate(`/home/tasks/${taskId}`),
    goBack: () => navigate("/home/lists"),
  };
}
