import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Modal,
  Form,
  Tab,
  Tabs,
  ProgressBar,
  ListGroup,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import teamService from "../../services/teamService";
import taskService from "../../services/taskService";
import { successToast, errorToast } from "../common/Noty";

/* ── State/Priority maps ─────────────────────────────────── */
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

const TeamDashboard = () => {
  const { id: teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Filters
  const [filterMember, setFilterMember] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [userTasks, setUserTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [reassignTask, setReassignTask] = useState(null);
  const [reassignTarget, setReassignTarget] = useState("");
  const [memberToRemove, setMemberToRemove] = useState(null);

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
    } catch (err) {
      errorToast("Error loading team data");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const loadTasks = useCallback(async () => {
    try {
      const filters = {};
      if (filterMember) filters.member = filterMember;
      if (filterState) filters.state = filterState;
      if (filterPriority) filters.priority = filterPriority;
      const data = await teamService.getTeamTasks(teamId, filters);
      setTasks(data);
    } catch (err) {
      errorToast("Error loading tasks");
    }
  }, [teamId, filterMember, filterState, filterPriority]);

  const loadHistory = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const data = await teamService.getAssignmentHistory(teamId);
      setHistory(data);
    } catch (err) {
      // Only admins can see history
    }
  }, [teamId, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === "tasks") loadTasks();
  }, [activeTab, loadTasks]);

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab, loadHistory]);

  // ===== Actions =====
  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await teamService.createInvitation(teamId, inviteUsername);
      successToast("Invitation sent to " + inviteUsername);
      setShowInviteModal(false);
      setInviteUsername("");
    } catch (err) {
      errorToast(err?.response?.data?.message || "Error sending invitation");
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await teamService.removeMember(teamId, memberToRemove.id);
      successToast("Member removed");
      setShowRemoveModal(false);
      setMemberToRemove(null);
      loadData();
    } catch (err) {
      errorToast("Error removing member");
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await teamService.updateMemberRole(teamId, memberId, newRole);
      successToast("Role updated");
      loadData();
    } catch (err) {
      errorToast("Error updating role");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!selectedTaskId) return;
    try {
      await teamService.addTaskToTeam(teamId, selectedTaskId);
      successToast("Task added to team");
      setShowAddTaskModal(false);
      setSelectedTaskId("");
      loadData();
      if (activeTab === "tasks") loadTasks();
    } catch (err) {
      errorToast("Error adding task to team");
    }
  };

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!reassignTask || !reassignTarget) return;
    try {
      await teamService.assignTask(teamId, reassignTask.id, reassignTarget);
      successToast(
        `Task "${reassignTask.nameOfTask}" reassigned to ${reassignTarget}`
      );
      setShowReassignModal(false);
      setReassignTask(null);
      setReassignTarget("");
      loadData();
      if (activeTab === "tasks") loadTasks();
    } catch (err) {
      errorToast("Error reassigning task");
    }
  };

  const loadUserTasks = async () => {
    try {
      const allTasks = await taskService.getAllTasks();
      setUserTasks(allTasks.filter((t) => !t.teamId));
    } catch (err) {
      setUserTasks([]);
    }
  };

  const openReassignModal = (task) => {
    setReassignTask(task);
    setReassignTarget("");
    setShowReassignModal(true);
  };

  const openRemoveModal = (member) => {
    setMemberToRemove(member);
    setShowRemoveModal(true);
  };

  const handleDeleteTeam = async () => {
    try {
      await teamService.deleteTeam(teamId);
      successToast("Team deleted successfully");
      navigate("/home/teams");
    } catch (err) {
      errorToast("Error deleting team");
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!team) {
    return (
      <Container className="text-center py-5">
        <p className="text-muted">Team not found</p>
        <Button variant="primary" onClick={() => navigate("/home/teams")}>
          Back to Teams
        </Button>
      </Container>
    );
  }

  const maxPending = dashboard?.members
    ? Math.max(...dashboard.members.map((m) => m.pendingTasks), 1)
    : 1;

  return (
    <Container
      fluid
      className="py-3 px-4 mt-2 mt-md-0"
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center">
          <Button
            variant="link"
            className="p-0 me-3 text-decoration-none"
            onClick={() => navigate("/home/teams")}
          >
            <i className="bi bi-arrow-left fs-5"></i>
          </Button>
          <div>
            <h3 className="mb-0 fw-bold">
              <i className="bi bi-people-fill me-2 text-primary"></i>
              {team.name}
            </h3>
            {team.description && (
              <small className="text-muted">{team.description}</small>
            )}
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              loadData();
              if (activeTab === "tasks") loadTasks();
              if (activeTab === "history") loadHistory();
            }}
            title="Refresh"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => {
              setShowAddTaskModal(true);
              loadUserTasks();
            }}
          >
            <i className="bi bi-plus-lg me-1"></i>Add Task
          </Button>
          {isAdmin && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowInviteModal(true)}
            >
              <i className="bi bi-person-plus me-1"></i>Invite Member
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setShowDeleteTeamModal(true)}
            >
              <i className="bi bi-trash me-1"></i>Delete Team
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={setActiveTab}
        className="mb-3"
        fill
      >
        {/* ===== Dashboard Tab ===== */}
        <Tab eventKey="dashboard" title={<><i className="bi bi-speedometer2 me-1"></i>Dashboard</>}>
          {dashboard && (
            <>
              {/* Stats */}
              <Row className="g-3 mb-4">
                {[
                  { label: "Total Tasks", value: dashboard.totalTasks, bg: "primary" },
                  { label: "Completed", value: dashboard.completedTasks, bg: "success" },
                  { label: "In Progress", value: dashboard.inProgressTasks, bg: "warning" },
                  { label: "Pending", value: dashboard.pendingTasks, bg: "info" },
                ].map((stat, i) => (
                  <Col key={i} xs={6} md={3}>
                    <Card className="text-center border rounded-3">
                      <Card.Body className="py-3">
                        <h3 className="fw-bold mb-0">{stat.value}</h3>
                        <small className="text-muted">{stat.label}</small>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Completion Progress */}
              {dashboard.totalTasks > 0 && (
                <Card className="border rounded-3 mb-4">
                  <Card.Body className="py-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="fw-semibold text-muted">Team Progress</small>
                      <Badge bg={dashboard.completedTasks === dashboard.totalTasks ? "success" : "primary"} pill>
                        {Math.round((dashboard.completedTasks / dashboard.totalTasks) * 100)}%
                      </Badge>
                    </div>
                    <ProgressBar
                      now={(dashboard.completedTasks / dashboard.totalTasks) * 100}
                      variant={dashboard.completedTasks === dashboard.totalTasks ? "success" : "primary"}
                      style={{ height: 8 }}
                      className="rounded-pill"
                    />
                  </Card.Body>
                </Card>
              )}

              {/* Team Workload */}
              <h5 className="fw-semibold mb-3">
                <i className="bi bi-bar-chart me-2"></i>Team Workload
              </h5>
              <Row className="g-3 mb-4">
                {dashboard.members.map((member) => (
                  <Col key={member.id} xs={12} md={6} lg={4}>
                    <Card className="border rounded-3 h-100">
                      <Card.Body>
                        <div className="d-flex align-items-center mb-2 overflow-hidden">
                          <i className="bi bi-person-circle fs-4 me-2 text-muted flex-shrink-0"></i>
                          <div className="text-truncate">
                            <strong className="text-truncate d-inline-block" style={{ maxWidth: "100%" }}>{member.username}</strong>
                            <Badge
                              bg={member.role === "ADMIN" ? "warning" : "secondary"}
                              className="ms-2"
                              pill
                            >
                              {member.role === "ADMIN" ? "Admin" : "Member"}
                            </Badge>
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between mb-1">
                            <small className="text-muted">Pending tasks</small>
                            <small className="fw-semibold">{member.pendingTasks}</small>
                          </div>
                          <ProgressBar
                            now={maxPending > 0 ? (member.pendingTasks / maxPending) * 100 : 0}
                            variant={
                              member.pendingTasks / maxPending > 0.8
                                ? "danger"
                                : member.pendingTasks / maxPending > 0.5
                                ? "warning"
                                : "success"
                            }
                            style={{ height: 6 }}
                            className="rounded-pill"
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Members Management */}
              <h5 className="fw-semibold mb-3">
                <i className="bi bi-people me-2"></i>Members
              </h5>
              <Card className="border rounded-3 mb-4">
                <ListGroup variant="flush">
                  {team.members &&
                    team.members.map((member) => (
                      <ListGroup.Item
                        key={member.id}
                        className="d-flex align-items-center justify-content-between flex-wrap gap-2"
                      >
                        <div className="d-flex align-items-center overflow-hidden" style={{ minWidth: 0 }}>
                          <i className="bi bi-person-circle me-2 fs-5 text-muted flex-shrink-0"></i>
                          <div className="text-truncate">
                            <span className="fw-medium">{member.username}</span>
                            <small className="text-muted ms-2 d-none d-sm-inline">
                              {member.email}
                            </small>
                          </div>
                          <Badge
                            bg={member.role === "ADMIN" ? "warning" : "secondary"}
                            className="ms-2 flex-shrink-0"
                            pill
                          >
                            {member.role === "ADMIN" ? "Admin" : "Member"}
                          </Badge>
                        </div>
                        {isAdmin && (
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant={member.role === "ADMIN" ? "outline-secondary" : "outline-warning"}
                              onClick={() =>
                                handleRoleChange(
                                  member.id,
                                  member.role === "ADMIN" ? "MEMBER" : "ADMIN"
                                )
                              }
                            >
                              {member.role === "ADMIN" ? "Demote" : "Promote"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => openRemoveModal(member)}
                            >
                              <i className="bi bi-x-lg"></i>
                            </Button>
                          </div>
                        )}
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              </Card>
            </>
          )}
        </Tab>

        {/* ===== Tasks Tab ===== */}
        <Tab eventKey="tasks" title={<><i className="bi bi-list-task me-1"></i>Tasks</>}>
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
                      onChange={(e) => setFilterMember(e.target.value)}
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
                    onChange={(e) => setFilterState(e.target.value)}
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
                    onChange={(e) => setFilterPriority(e.target.value)}
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
                    onClick={() => {
                      setFilterMember("");
                      setFilterState("");
                      setFilterPriority("");
                    }}
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
            <Row className="g-2">
              {tasks.map((task) => (
                <Col key={task.id} xs={12}>
                  <Card className="border rounded-3">
                    <Card.Body className="py-2 px-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                        <div className="d-flex align-items-center flex-grow-1 me-2" style={{ minWidth: 0 }}>
                          <span
                            className="fw-medium text-truncate me-2"
                            role="button"
                            onClick={() =>
                              navigate(`/home/tasks/${task.id}`)
                            }
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
                              onClick={() => openReassignModal(task)}
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
          )}
        </Tab>

        {/* ===== History Tab (Admin only) ===== */}
        {isAdmin && (
          <Tab eventKey="history" title={<><i className="bi bi-clock-history me-1"></i>History</>}>
            {history.length === 0 ? (
              <div className="text-center text-muted py-5">
                <p>No assignment history yet</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {history.map((h) => (
                  <ListGroup.Item key={h.id} className="border-bottom py-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span className="fw-medium">{h.taskName}</span>
                        <br />
                        <small className="text-muted">
                          {h.fromUsername ? (
                            <>
                              <Badge bg="outline-secondary" className="border me-1">
                                {h.fromUsername}
                              </Badge>
                              <i className="bi bi-arrow-right mx-1"></i>
                            </>
                          ) : (
                            <span className="me-1">Assigned to</span>
                          )}
                          <Badge bg="primary" className="me-1">
                            {h.toUsername}
                          </Badge>
                          <span className="text-muted">
                            by {h.changedByUsername}
                          </span>
                        </small>
                      </div>
                      <small className="text-muted">
                        {new Date(h.changedDate).toLocaleString()}
                      </small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Tab>
        )}
      </Tabs>

      {/* ===== Invite Member Modal ===== */}
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-plus me-2"></i>Invite Member
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleInvite}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder="Enter username to invite"
                required
                autoFocus
              />
              <Form.Text className="text-muted">
                The user will receive an in-app notification to accept or reject the invitation.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              <i className="bi bi-send me-1"></i>Send Invitation
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===== Reassign Task Modal ===== */}
      <Modal show={showReassignModal} onHide={() => setShowReassignModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-arrow-left-right me-2"></i>Reassign Task
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReassign}>
          <Modal.Body>
            {reassignTask && (
              <>
                <div className="mb-3 p-2 bg-body-tertiary rounded">
                  <small className="text-muted">Task:</small>
                  <p className="mb-0 fw-medium">{reassignTask.nameOfTask}</p>
                  {reassignTask.user && (
                    <small className="text-muted">
                      Current owner: <strong>{reassignTask.user}</strong>
                    </small>
                  )}
                </div>
                <Form.Group>
                  <Form.Label>Reassign to</Form.Label>
                  <Form.Select
                    value={reassignTarget}
                    onChange={(e) => setReassignTarget(e.target.value)}
                    required
                  >
                    <option value="">Select a member...</option>
                    {team.members &&
                      team.members
                        .filter((m) => m.username !== reassignTask.user)
                        .map((m) => (
                          <option key={m.id} value={m.username}>
                            {m.username} ({m.role === "ADMIN" ? "Admin" : "Member"})
                          </option>
                        ))}
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReassignModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!reassignTarget}>
              <i className="bi bi-arrow-left-right me-1"></i>Reassign
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===== Remove Member Confirmation Modal ===== */}
      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-x me-2 text-danger"></i>Remove Member
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {memberToRemove && (
            <p>
              Are you sure you want to remove{" "}
              <strong>{memberToRemove.username}</strong> from this team?
              Their assigned tasks will be unassigned.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRemoveMember}>
            <i className="bi bi-person-x me-1"></i>Remove
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== Add Task Modal ===== */}
      <Modal show={showAddTaskModal} onHide={() => setShowAddTaskModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Task to Team</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddTask}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Select Task</Form.Label>
              <Form.Select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                required
              >
                <option value="">Select a task...</option>
                {userTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nameOfTask}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Only your tasks not already in a team are shown.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddTaskModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add to Team
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===== Delete Team Confirmation Modal ===== */}
      <Modal show={showDeleteTeamModal} onHide={() => setShowDeleteTeamModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-trash me-2 text-danger"></i>Delete Team
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete <strong>{team.name}</strong>?
            All tasks will be removed from the team but will remain in their
            owners' task lists.
          </p>
          <p className="text-danger mb-0">
            <i className="bi bi-exclamation-triangle me-1"></i>
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteTeamModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTeam}>
            <i className="bi bi-trash me-1"></i>Delete Team
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeamDashboard;
