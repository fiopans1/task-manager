import { useCallback, useEffect, useState } from "react";
import taskService from "@/services/taskService";

export function useCalendarEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getEvents();
      setEvents(
        data.map((task) => ({
          id: task.id,
          title: task.nameOfTask,
          start: new Date(task.startTime),
          end: new Date(task.endTime),
          category: task.category || "default",
        })),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { events, loading, error, reload: load };
}
