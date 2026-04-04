import React from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
} from "react-bootstrap";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

const STATE_MAP = {
  NEW: { label: "New", bg: "info" },
  IN_PROGRESS: { label: "In Progress", bg: "warning" },
  COMPLETED: { label: "Completed", bg: "success" },
  CANCELLED: { label: "Cancelled", bg: "danger" },
  PAUSSED: { label: "Paused", bg: "secondary" },
};

const PRIORITY_MAP = {
  CRITICAL: { label: "Critical", bg: "danger" },
  HIGH: { label: "High", bg: "warning" },
  MEDIUM: { label: "Medium", bg: "info" },
  LOW: { label: "Low", bg: "secondary" },
  MIN: { label: "Min", bg: "dark" },
};

const TasksTab = ({
  tasks,
  team,
  isAdmin,
  filterMember,
  filterState,
  filterPriority,
  onFilterMemberChange,
  onFilterStateChange,
  onFilterPriorityChange,
  onClearFilters,
  onReassign,
  onNavigateToTask,
}) => {
  return (
    <>
      {/* Filters */}
      <Card className="border rounded-3 mb-3">
        <Card.Body className="py-2">
          <Row className="g-2 align-items-end">
            {isAdmin && (
              <Col xs={12} sm={4}>
                <Form.Label className="small mb-1">Member</Form.Label>
                <Form.Select
                  size="sm"
                  value={filterMember}
                  onChange={(e) => onFilterMemberChange(e.target.value)}
                >
                  <option value="">All Members</option>
                  {team.members &&
                    team.members.map((m) => (
                      <option key={m.id} value={m.username}>
                        {m.username}
                      </option>
                    ))}
                </Form.Select>
              </Col>
            )}
            <Col xs={12} sm={isAdmin ? 3 : 5}>
              <Form.Label className="small mb-1">State</Form.Label>
              <Form.Select
                size="sm"
                value={filterState}
                onChange={(e) => onFilterStateChange(e.target.value)}
              >
                <option value="">All States</option>
                {Object.entries(STATE_MAP).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} sm={isAdmin ? 3 : 5}>
              <Form.Label className="small mb-1">Priority</Form.Label>
              <Form.Select
                size="sm"
                value={filterPriority}
                onChange={(e) => onFilterPriorityChange(e.target.value)}
              >
                <option value="">All Priorities</option>
                {Object.entries(PRIORITY_MAP).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} sm={2}>
              <Button
                variant="outline-secondary"
                size="sm"
                className="w-100"
                onClick={onClearFilters}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p>No tasks found{!isAdmin ? " assigned to you" : " with selected filters"}</p>
        </div>
      ) : (
        <TaskListWithPagination
          tasks={tasks}
          isAdmin={isAdmin}
          onReassign={onReassign}
          onNavigateToTask={onNavigateToTask}
        />
      )}
    </>
  );
};

const TaskListWithPagination = ({ tasks, isAdmin, onReassign, onNavigateToTask }) => {
  const { displayedItems: paginatedTasks, LoadMoreSpinner } = useInfiniteScroll(tasks);

  return (
    <>
      <Row className="g-2">
        {paginatedTasks.map((task) => (
          <Col key={task.id} xs={12}>
            <Card className="border rounded-3">
              <Card.Body className="py-2 px-3">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                  <div className="d-flex align-items-center flex-grow-1 me-2" style={{ minWidth: 0 }}>
                    <span
                      className="fw-medium text-truncate me-2"
                      role="button"
                      onClick={() => onNavigateToTask(task.id)}
                    >
                      {task.nameOfTask}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-1 flex-shrink-0 flex-wrap">
                    {task.user && (
                      <Badge bg="dark" pill>
                        <i className="bi bi-person me-1"></i>
                        {task.user}
                      </Badge>
                    )}
                    <Badge bg={STATE_MAP[task.state]?.bg || "secondary"} pill>
                      {STATE_MAP[task.state]?.label || task.state}
                    </Badge>
                    <Badge bg={PRIORITY_MAP[task.priority]?.bg || "secondary"} pill>
                      {PRIORITY_MAP[task.priority]?.label || task.priority}
                    </Badge>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="py-0 px-2"
                        onClick={() => onReassign(task)}
                        title="Reassign task"
                      >
                        <i className="bi bi-arrow-left-right"></i>
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <LoadMoreSpinner />
    </>
  );
};

export default TasksTab;
