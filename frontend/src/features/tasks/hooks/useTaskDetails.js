import { useCallback, useEffect, useState } from "react";
import taskService from "@/services/taskService";

export function useTaskDetails(taskId) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await taskService.getTaskById(taskId);
        if (!cancelled) setTask(data);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (taskId) load();

    return () => {
      cancelled = true;
    };
  }, [taskId, refreshKey]);

  const reload = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  return { task, loading, error, reload };
}
