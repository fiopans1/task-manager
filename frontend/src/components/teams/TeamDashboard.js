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
  Stack,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import teamService from "../../services/teamService";
import taskService from "../../services/taskService";
import { successToast, errorToast } from "../common/Noty";
import DashboardTab from "./DashboardTab";
import TasksTab from "./TasksTab";
import HistoryTab from "./HistoryTab";
import InvitationsTab from "./InvitationsTab";

const TeamDashboard = () => {
  const { id: teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMore, setShowMore] = useState(false);

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
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showLeaveTeamModal, setShowLeaveTeamModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [userTasks, setUserTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [reassignTask, setReassignTask] = useState(null);
  const [reassignTarget, setReassignTarget] = useState("");
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

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

  const loadInvitations = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const data = await teamService.getTeamInvitations(teamId);
      setInvitations(data);
    } catch (err) {
      // Only admins can see invitations
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

  useEffect(() => {
    if (activeTab === "invitations") loadInvitations();
  }, [activeTab, loadInvitations]);

  // ===== Actions =====
  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await teamService.createInvitation(teamId, inviteUsername);
      successToast("Invitation sent to " + inviteUsername);
      setShowInviteModal(false);
      setInviteUsername("");
      if (activeTab === "invitations") loadInvitations();
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

  const handleEditTeam = async (e) => {
    e.preventDefault();
    try {
      await teamService.updateTeam(teamId, { name: editName, description: editDescription });
      successToast("Team updated");
      setShowEditTeamModal(false);
      loadData();
    } catch (err) {
      errorToast("Error updating team");
    }
  };

  const openEditTeamModal = () => {
    setEditName(team.name || "");
    setEditDescription(team.description || "");
    setShowEditTeamModal(true);
  };

  const handleLeaveTeam = async () => {
    try {
      await teamService.leaveTeam(teamId);
      successToast("You left the team");
      navigate("/home/teams");
    } catch (err) {
      errorToast(err?.response?.data?.message || "Error leaving team");
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      await teamService.cancelInvitation(teamId, invitationId);
      successToast("Invitation cancelled");
      loadInvitations();
    } catch (err) {
      errorToast("Error cancelling invitation");
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

  const memberCount = team.members ? team.members.length : 0;
  const completionPercent = dashboard && dashboard.totalTasks > 0
    ? Math.round((dashboard.completedTasks / dashboard.totalTasks) * 100)
    : 0;

  return (
    <Container
      fluid
      className="py-3 px-4 mt-2 mt-md-0"
    >
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Stack direction="horizontal" gap={3} className="align-items-center flex-wrap">
            <Button
              variant="outline-secondary"
              size="lg"
              onClick={() => navigate("/home/teams")}
              className="rounded-circle p-2 shadow-sm"
            >
              <i className="bi bi-arrow-left fs-5"></i>
            </Button>
            <div className="flex-grow-1">
              <h1 className="mb-1 fw-bold text-body" style={{ fontSize: "2rem" }}>
                Team Details
              </h1>
              <p className="text-muted mb-0">Team overview and management</p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  loadData();
                  if (activeTab === "tasks") loadTasks();
                  if (activeTab === "history") loadHistory();
                  if (activeTab === "invitations") loadInvitations();
                }}
                className="rounded-3 shadow-sm"
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
                className="rounded-3 shadow-sm"
                title="Add Task"
              >
                <i className="bi bi-plus-lg"></i><span className="d-none d-sm-inline ms-1">Add Task</span>
              </Button>
              {isAdmin && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                  className="rounded-3 shadow-sm"
                  title="Invite Member"
                >
                  <i className="bi bi-person-plus"></i><span className="d-none d-sm-inline ms-1">Invite</span>
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={openEditTeamModal}
                  className="rounded-3 shadow-sm"
                  title="Edit Team"
                >
                  <i className="bi bi-pencil"></i><span className="d-none d-sm-inline ms-1">Edit</span>
                </Button>
              )}
              {isAdmin ? (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowDeleteTeamModal(true)}
                  className="rounded-3 shadow-sm"
                  title="Delete Team"
                >
                  <i className="bi bi-trash"></i><span className="d-none d-sm-inline ms-1">Delete</span>
                </Button>
              ) : (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowLeaveTeamModal(true)}
                  className="rounded-3 shadow-sm"
                  title="Leave Team"
                >
                  <i className="bi bi-box-arrow-right"></i><span className="d-none d-sm-inline ms-1">Leave</span>
                </Button>
              )}
            </div>
          </Stack>
        </Col>
      </Row>

      {/* Main Card */}
      <Card className="border-0 shadow-lg mb-4" style={{ borderRadius: "20px", overflow: "hidden" }}>
        <Card.Header
          className="border-0 text-white p-4"
          style={{
            background: "linear-gradient(135deg, #007bff, #6f42c1)",
          }}
        >
          <Stack direction="horizontal" className="justify-content-between align-items-center">
            <div>
              <h3 className="mb-1" style={{ fontWeight: "600" }}>
                {team.name}
              </h3>
              <Stack direction="horizontal" gap={2}>
                <i className="bi bi-people-fill"></i>
                <small>Team ID: #{team.id}</small>
              </Stack>
            </div>
            <Badge
              bg="light"
              text="dark"
              className="px-4 py-2 rounded-pill"
              style={{ fontSize: "0.9rem", fontWeight: "600" }}
            >
              <i className="bi bi-people me-1"></i>
              {memberCount} {memberCount === 1 ? "Member" : "Members"}
            </Badge>
          </Stack>

          {dashboard && dashboard.totalTasks > 0 && (
            <div className="mt-3">
              <small className="text-white-50">Progress</small>
              <ProgressBar
                now={completionPercent}
                className="mt-1"
                style={{ height: "8px", borderRadius: "4px" }}
                variant={completionPercent === 100 ? "light" : "warning"}
              />
            </div>
          )}
        </Card.Header>

        <Card.Body className="p-4">
          {/* Badges row */}
          <Row className="mb-4">
            <Col>
              <Stack direction="horizontal" gap={2} className="flex-wrap">
                <Badge
                  bg="dark"
                  className="px-3 py-2 rounded-pill d-flex align-items-center gap-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  <i className="bi bi-people"></i>
                  {memberCount} {memberCount === 1 ? "Member" : "Members"}
                </Badge>

                <Badge
                  bg={isAdmin ? "warning" : "secondary"}
                  className="px-3 py-2 rounded-pill d-flex align-items-center gap-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  <i className="bi bi-shield"></i>
                  {isAdmin ? "Admin" : "Member"}
                </Badge>

                {dashboard && (
                  <Badge
                    bg="primary"
                    className="px-3 py-2 rounded-pill d-flex align-items-center gap-1"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <i className="bi bi-list-task"></i>
                    {dashboard.totalTasks} {dashboard.totalTasks === 1 ? "Task" : "Tasks"}
                  </Badge>
                )}
              </Stack>
            </Col>
          </Row>

          {/* Created date card */}
          {team.createdDate && (
            <Row className="mb-4">
              <Col md={4} className="mb-3">
                <Card className="border-0 bg-body-tertiary h-100" style={{ borderRadius: "15px" }}>
                  <Card.Body className="text-center py-3">
                    <i className="bi bi-calendar3 text-primary mb-2 d-block" style={{ fontSize: "1.5rem" }}></i>
                    <h6 className="mb-1 text-muted">Created</h6>
                    <small className="fw-semibold">
                      {new Date(team.createdDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Description card */}
          <Card
            className="border-0 shadow-sm bg-body-tertiary"
            style={{ borderRadius: "15px" }}
          >
            <Card.Body className="p-4">
              <Stack direction="horizontal" gap={2} className="mb-3">
                <i className="bi bi-file-text text-primary" style={{ fontSize: "1.25rem" }}></i>
                <h5 className="mb-0 fw-semibold text-body">
                  Description
                </h5>
              </Stack>

              {team.description ? (
                team.description.length < 100 ? (
                  <p className="mb-0 text-body-secondary" style={{ lineHeight: "1.6" }}>
                    {team.description}
                  </p>
                ) : (
                  <>
                    <p className="mb-2 text-body-secondary" style={{ lineHeight: "1.6" }}>
                      {showMore
                        ? team.description
                        : `${team.description.substring(0, 100)}...`}
                    </p>
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none fw-semibold"
                      onClick={() => setShowMore(!showMore)}
                    >
                      {!showMore ? "Show More ↓" : "Show Less ↑"}
                    </Button>
                  </>
                )
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-file-text text-muted d-block mb-2" style={{ fontSize: "3rem" }}></i>
                  <p className="text-muted mb-0">No description available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={setActiveTab}
        className="mb-3"
        fill
      >
        <Tab eventKey="dashboard" title={<><i className="bi bi-speedometer2 me-1"></i>Dashboard</>}>
          <DashboardTab
            dashboard={dashboard}
            team={team}
            isAdmin={isAdmin}
            maxPending={maxPending}
            onRoleChange={handleRoleChange}
            onRemoveMember={openRemoveModal}
          />
        </Tab>

        <Tab eventKey="tasks" title={<><i className="bi bi-list-task me-1"></i>Tasks</>}>
          <TasksTab
            tasks={tasks}
            team={team}
            isAdmin={isAdmin}
            filterMember={filterMember}
            filterState={filterState}
            filterPriority={filterPriority}
            onFilterMemberChange={setFilterMember}
            onFilterStateChange={setFilterState}
            onFilterPriorityChange={setFilterPriority}
            onClearFilters={() => {
              setFilterMember("");
              setFilterState("");
              setFilterPriority("");
            }}
            onReassign={openReassignModal}
            onNavigateToTask={(taskId) => navigate(`/home/tasks/${taskId}`)}
          />
        </Tab>

        {isAdmin && (
          <Tab eventKey="history" title={<><i className="bi bi-clock-history me-1"></i>History</>}>
            <HistoryTab history={history} />
          </Tab>
        )}

        {isAdmin && (
          <Tab eventKey="invitations" title={<><i className="bi bi-envelope me-1"></i>Invitations</>}>
            <InvitationsTab
              invitations={invitations}
              onCancelInvitation={handleCancelInvitation}
            />
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

      {/* ===== Edit Team Modal ===== */}
      <Modal show={showEditTeamModal} onHide={() => setShowEditTeamModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil me-2"></i>Edit Team
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditTeam}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Team Name</Form.Label>
              <Form.Control
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Team name"
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Team description (optional)"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditTeamModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              <i className="bi bi-check-lg me-1"></i>Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===== Leave Team Confirmation Modal ===== */}
      <Modal show={showLeaveTeamModal} onHide={() => setShowLeaveTeamModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-box-arrow-right me-2 text-danger"></i>Leave Team
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to leave <strong>{team.name}</strong>?
            Your tasks will be removed from the team.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLeaveTeamModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLeaveTeam}>
            <i className="bi bi-box-arrow-right me-1"></i>Leave Team
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeamDashboard;
