import { useCallback, useEffect, useRef, useState } from "react";
import taskService from "../services/taskService";

/**
 * Loads and controls the timer for a single task.
 * The elapsed time is computed from the server snapshot plus the time
 * elapsed since that snapshot was received, avoiding client clock skew.
 */
export default function useTaskTimer(taskId) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [action, setAction] = useState(null);
  const [baseTime, setBaseTime] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const requestIdRef = useRef(0);

  const applyStatus = useCallback((nextStatus) => {
    const timestamp = Date.now();
    setStatus(nextStatus);
    setBaseTime(timestamp);
    setNow(timestamp);
    setError(null);
  }, []);

  const reload = useCallback(async () => {
    if (!taskId) {
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const nextStatus = await taskService.getTimerStatus(taskId);
      if (requestId === requestIdRef.current) {
        applyStatus(nextStatus);
      }
    } catch (requestError) {
      if (requestId === requestIdRef.current) {
        setError(requestError);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [taskId, applyStatus]);

  useEffect(() => {
    setStatus(null);
    setError(null);
    setLoading(true);
    reload();

    return () => {
      requestIdRef.current += 1;
    };
  }, [reload]);

  useEffect(() => {
    if (!status?.running) {
      return undefined;
    }

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status?.running]);

  const start = useCallback(async () => {
    if (!taskId) {
      return null;
    }

    const requestId = ++requestIdRef.current;
    setAction("start");

    try {
      const nextStatus = await taskService.startTimer(taskId);
      if (requestId === requestIdRef.current) {
        applyStatus(nextStatus);
      }
      return nextStatus;
    } finally {
      if (requestId === requestIdRef.current) {
        setAction(null);
      }
    }
  }, [taskId, applyStatus]);

  const stop = useCallback(async () => {
    if (!taskId) {
      return null;
    }

    const requestId = ++requestIdRef.current;
    setAction("stop");

    try {
      const nextStatus = await taskService.stopTimer(taskId);
      if (requestId === requestIdRef.current) {
        applyStatus(nextStatus);
      }
      return nextStatus;
    } finally {
      if (requestId === requestIdRef.current) {
        setAction(null);
      }
    }
  }, [taskId, applyStatus]);

  const activeElapsedSeconds = status?.running
    ? Math.max(0, Number(status.activeElapsedSeconds) || 0)
      + Math.max(0, Math.floor((now - baseTime) / 1000))
    : 0;

  const liveTotalSeconds = Math.max(0, Number(status?.totalSeconds) || 0)
    + activeElapsedSeconds;

  return {
    status,
    loading,
    error,
    action,
    activeElapsedSeconds,
    liveTotalSeconds,
    start,
    stop,
    reload,
  };
}
