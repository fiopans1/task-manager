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
  MIN: { label: "Min", bg: "light" },
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
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [newMemberUsername, setNewMemberUsername] = useState("");
  const [userTasks, setUserTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  // Drag & Drop
  const [draggedTask, setDraggedTask] = useState(null);

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
      if (filterMember) filters.assignedTo = filterMember;
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

  // ===== Drag & Drop =====
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetUsername) => {
    e.preventDefault();
    if (!draggedTask || !isAdmin) return;
    if (draggedTask.assignedTo === targetUsername) {
      setDraggedTask(null);
      return;
    }

    try {
      await teamService.assignTask(teamId, draggedTask.id, targetUsername);
      successToast(
        `Task "${draggedTask.nameOfTask}" reassigned to ${targetUsername}`
      );
      loadData();
      if (activeTab === "tasks") loadTasks();
    } catch (err) {
      errorToast("Error reassigning task");
    }
    setDraggedTask(null);
  };

  // ===== Actions =====
  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await teamService.createInvitation(teamId, inviteEmail);
      successToast("Invitation sent to " + inviteEmail);
      setShowInviteModal(false);
      setInviteEmail("");
    } catch (err) {
      errorToast("Error sending invitation");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await teamService.addMember(teamId, newMemberUsername);
      successToast("Member added successfully");
      setShowAddMemberModal(false);
      setNewMemberUsername("");
      loadData();
    } catch (err) {
      errorToast("Error adding member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await teamService.removeMember(teamId, memberId);
      successToast("Member removed");
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

  const loadUserTasks = async () => {
    try {
      const resource = taskService.getTasks();
      const data = resource.read();
      setUserTasks(data.filter((t) => !t.teamId));
    } catch (err) {
      // If suspense throws, handle differently
      try {
        const data = await taskService.getTaskById(null);
        setUserTasks(data);
      } catch (e) {
        setUserTasks([]);
      }
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
      className="py-3 px-4 overflow-auto"
      style={{ height: "100%" }}
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
        {isAdmin && (
          <div className="d-flex gap-2">
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
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowAddMemberModal(true)}
            >
              <i className="bi bi-person-plus me-1"></i>Add Member
            </Button>
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => setShowInviteModal(true)}
            >
              <i className="bi bi-envelope me-1"></i>Invite
            </Button>
          </div>
        )}
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
                    <Card
                      className="border rounded-3 h-100"
                      onDragOver={isAdmin ? handleDragOver : undefined}
                      onDrop={
                        isAdmin
                          ? (e) => handleDrop(e, member.username)
                          : undefined
                      }
                      style={
                        isAdmin
                          ? { transition: "box-shadow 0.2s" }
                          : undefined
                      }
                    >
                      <Card.Body>
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-person-circle fs-4 me-2 text-muted"></i>
                          <div>
                            <strong>{member.username}</strong>
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
                        {isAdmin && (
                          <small className="text-muted fst-italic">
                            <i className="bi bi-arrows-move me-1"></i>
                            Drop tasks here to reassign
                          </small>
                        )}
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
                        className="d-flex align-items-center justify-content-between"
                      >
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-circle me-2 fs-5 text-muted"></i>
                          <div>
                            <span className="fw-medium">{member.username}</span>
                            <small className="text-muted ms-2">
                              {member.email}
                            </small>
                          </div>
                          <Badge
                            bg={member.role === "ADMIN" ? "warning" : "secondary"}
                            className="ms-2"
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
                              onClick={() => handleRemoveMember(member.id)}
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
                <Col xs={12} sm={3}>
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
                <Col xs={12} sm={3}>
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
              <p>No tasks found with selected filters</p>
            </div>
          ) : (
            <Row className="g-2">
              {tasks.map((task) => (
                <Col key={task.id} xs={12}>
                  <Card
                    className="border rounded-3 task-card"
                    draggable={isAdmin}
                    onDragStart={
                      isAdmin ? (e) => handleDragStart(e, task) : undefined
                    }
                    style={isAdmin ? { cursor: "grab" } : undefined}
                  >
                    <Card.Body className="py-2 px-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center flex-grow-1 me-2">
                          {isAdmin && (
                            <i className="bi bi-grip-vertical text-muted me-2"></i>
                          )}
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
                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                          {task.assignedTo && (
                            <Badge bg="dark" pill>
                              <i className="bi bi-person me-1"></i>
                              {task.assignedTo}
                            </Badge>
                          )}
                          <Badge bg={STATE_MAP[task.state]?.bg || "secondary"} pill>
                            {STATE_MAP[task.state]?.label || task.state}
                          </Badge>
                          <Badge bg={PRIORITY_MAP[task.priority]?.bg || "secondary"} pill>
                            {PRIORITY_MAP[task.priority]?.label || task.priority}
                          </Badge>
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

      {/* ===== Invite Modal ===== */}
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Invite to Team</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleInvite}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
              <Form.Text className="text-muted">
                An invitation link will be generated. Share it with the user to join.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Invitation
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===== Add Member Modal ===== */}
      <Modal show={showAddMemberModal} onHide={() => setShowAddMemberModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Member</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddMember}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={newMemberUsername}
                onChange={(e) => setNewMemberUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddMemberModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Member
            </Button>
          </Modal.Footer>
        </Form>
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
                Only tasks not already in a team are shown.
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
    </Container>
  );
};

export default TeamDashboard;
