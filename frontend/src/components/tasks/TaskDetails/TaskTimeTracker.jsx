import { useCallback, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Row,
  Spinner,
  Stack,
  Table,
} from "react-bootstrap";
import { Clock, PlayFill, StopFill } from "react-bootstrap-icons";
import useTaskTimer from "../../../hooks/useTaskTimer";
import { useServerInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import taskService from "../../../services/taskService";
import { formatDuration } from "../../../utils/formatDuration";
import { promiseToast } from "../../common/Noty";

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Unknown error";

const formatDateTime = (value) => {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return String(value);
  }
};

const TaskTimeTracker = ({ taskId, onTimerChange }) => {
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const {
    status,
    loading,
    error,
    action,
    activeElapsedSeconds,
    liveTotalSeconds,
    start,
    stop,
    reload,
  } = useTaskTimer(taskId);

  const fetchPage = useCallback(
    async (page, size) => {
      if (!taskId) return { content: [], last: true };
      return taskService.fetchTimeEntriesPage(taskId, page, size);
    },
    [taskId],
  );

  const {
    items: entries,
    initialLoading: entriesLoading,
    LoadMoreSpinner,
  } = useServerInfiniteScroll(fetchPage, 20, [taskId, historyRefreshKey]);

  const running = Boolean(status?.running);
  const actionInProgress = action !== null;

  const handleStart = async () => {
    try {
      await promiseToast(start(), {
        loading: "Starting timer...",
        success: "Timer started",
        error: (requestError) => "Error: " + getErrorMessage(requestError),
      });
      setHistoryRefreshKey((key) => key + 1);
      onTimerChange?.();
    } catch (requestError) {
      // Toast already shown by promiseToast.
    }
  };

  const handleStop = async () => {
    try {
      await promiseToast(stop(), {
        loading: "Stopping timer...",
        success: "Timer stopped",
        error: (requestError) => "Error: " + getErrorMessage(requestError),
      });
      setHistoryRefreshKey((key) => key + 1);
      onTimerChange?.();
    } catch (requestError) {
      // Toast already shown by promiseToast.
    }
  };

  if (loading && !status) {
    return (
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="text-center py-4">
          <Spinner animation="border" variant="primary" size="sm" />
          <span className="text-body-secondary ms-2">Loading time tracking...</span>
        </Card.Body>
      </Card>
    );
  }

  if (error && !status) {
    return (
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="py-4">
          <Stack direction="horizontal" gap={3} className="flex-wrap">
            <div className="flex-grow-1">
              <h5 className="mb-1">Time tracking unavailable</h5>
              <p className="text-body-secondary mb-0">{getErrorMessage(error)}</p>
            </div>
            <Button variant="outline-primary" className="rounded-pill px-4" onClick={reload}>
              Retry
            </Button>
          </Stack>
        </Card.Body>
      </Card>
    );
  }

  const mainTime = running ? activeElapsedSeconds : liveTotalSeconds;
  const sessionsCount = status?.sessionsCount ?? 0;

  return (
    <Card className="border-0 shadow-sm rounded-4 mb-4">
      <Card.Body className="p-4">
        <Stack
          direction="horizontal"
          className="justify-content-between align-items-start flex-wrap gap-3 mb-3"
        >
          <div>
            <h4 className="mb-1 d-flex align-items-center gap-2">
              <Clock size={22} className="text-primary" />
              Time Tracking
            </h4>
            <p className="text-body-secondary mb-0">
              Track how much time you spend on this task.
            </p>
          </div>
          <Badge
            bg={running ? "success" : "secondary"}
            pill
            className="px-3 py-2 d-flex align-items-center gap-1"
          >
            {running && (
              <span
                className="spinner-grow spinner-grow-sm"
                role="status"
                aria-hidden="true"
              />
            )}
            {running ? "Tracking" : "Idle"}
          </Badge>
        </Stack>

        <Row className="g-3 align-items-stretch">
          <Col lg={7}>
            <div className="bg-body-tertiary rounded-4 p-4 text-center h-100">
              <div className="text-body-secondary small text-uppercase fw-semibold mb-2">
                {running ? "Current session" : "Total tracked"}
              </div>
              <div
                className="display-5 fw-bold font-monospace"
                role="timer"
                aria-label={running ? "Current session duration" : "Total tracked time"}
              >
                {formatDuration(mainTime)}
              </div>
              {running ? (
                <>
                  <div className="text-body-secondary mt-2">
                    Total:{" "}
                    <span className="fw-semibold font-monospace">
                      {formatDuration(liveTotalSeconds)}
                    </span>
                  </div>
                  {status?.activeEntry?.startTime && (
                    <div className="text-body-secondary small mt-1">
                      Started {formatDateTime(status.activeEntry.startTime)}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-body-secondary small mt-2">
                  {sessionsCount === 0
                    ? "No sessions recorded yet"
                    : `${sessionsCount} session${sessionsCount === 1 ? "" : "s"} recorded`}
                </div>
              )}
            </div>
          </Col>

          <Col lg={5}>
            <div className="d-flex flex-column justify-content-center h-100 gap-2">
              <Button
                variant={running ? "danger" : "success"}
                size="lg"
                className="rounded-pill d-flex align-items-center justify-content-center gap-2"
                onClick={running ? handleStop : handleStart}
                disabled={actionInProgress}
              >
                {actionInProgress ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : running ? (
                  <StopFill size={20} />
                ) : (
                  <PlayFill size={20} />
                )}
                {action === "start"
                  ? "Starting..."
                  : action === "stop"
                    ? "Stopping..."
                    : running
                      ? "Stop timer"
                      : "Start timer"}
              </Button>
              <small className="text-body-secondary text-center">
                {running
                  ? "The timer keeps running even if you leave this page."
                  : "You can start it again as many times as you need."}
              </small>
            </div>
          </Col>
        </Row>

        <hr className="my-4" />

        <Stack
          direction="horizontal"
          className="justify-content-between align-items-center mb-3"
        >
          <h5 className="mb-0">Sessions</h5>
          <Badge bg="light" text="dark" className="border">
            {sessionsCount}
          </Badge>
        </Stack>

        {entriesLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" className="me-2" />
            <span className="text-body-secondary">Loading sessions...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-4 text-body-secondary">
            <Clock size={32} className="mb-2 opacity-50" />
            <p className="mb-0">No time tracked yet. Start the timer to create a session.</p>
          </div>
        ) : (
          <>
            <Table responsive size="sm" className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Start</th>
                  <th>End</th>
                  <th>Duration</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isActiveEntry = entry.active;
                  const duration = isActiveEntry
                    ? activeElapsedSeconds
                    : entry.durationSeconds;

                  return (
                    <tr key={entry.id}>
                      <td className="text-nowrap">{formatDateTime(entry.startTime)}</td>
                      <td className="text-nowrap">
                        {isActiveEntry ? (
                          <Badge bg="success" pill className="d-inline-flex align-items-center gap-1">
                            <span
                              className="spinner-grow spinner-grow-sm"
                              role="status"
                              aria-hidden="true"
                            />
                            Running
                          </Badge>
                        ) : (
                          formatDateTime(entry.endTime)
                        )}
                      </td>
                      <td className="text-nowrap font-monospace">
                        {formatDuration(duration)}
                      </td>
                      <td className="text-nowrap">{entry.user || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <LoadMoreSpinner />
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default TaskTimeTracker;
