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
import { useTranslation } from "react-i18next";
import teamService from "../../services/teamService";
import taskService from "../../services/taskService";
import { successToast, errorToast } from "../common/Noty";
import DashboardTab from "./DashboardTab";
import TasksTab from "./TasksTab";
import HistoryTab from "./HistoryTab";
import InvitationsTab from "./InvitationsTab";
import NewEditTeam from "./NewEditTeam";

const TeamDashboard = () => {
  const { t } = useTranslation();
  const { id: teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMore, setShowMore] = useState(false);
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

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
  const [inviteValidated, setInviteValidated] = useState(false);
  const [userTasks, setUserTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [addTaskValidated, setAddTaskValidated] = useState(false);
  const [reassignTask, setReassignTask] = useState(null);
  const [reassignTarget, setReassignTarget] = useState("");
  const [reassignValidated, setReassignValidated] = useState(false);
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
      errorToast(t('teamDashboard.errorLoadingTeam'));
    } finally {
      setLoading(false);
    }
  }, [teamId, t]);

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
    if (activeTab === "invitations") loadInvitations();
  }, [activeTab, loadInvitations]);

  // ===== Actions =====
  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteValidated(true);
    if (!inviteUsername || inviteUsername.trim() === "") {
      return;
    }
    try {
      await teamService.createInvitation(teamId, inviteUsername);
      successToast(t('teamDashboard.invitationSent', { username: inviteUsername }));
      setShowInviteModal(false);
      setInviteUsername("");
      setInviteValidated(false);
      if (activeTab === "invitations") loadInvitations();
    } catch (err) {
      errorToast(err?.response?.data?.message || t('teamDashboard.errorSendingInvitation'));
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await teamService.removeMember(teamId, memberToRemove.id);
      successToast(t('teamDashboard.memberRemoved'));
      setShowRemoveModal(false);
      setMemberToRemove(null);
      loadData();
    } catch (err) {
      errorToast(t('teamDashboard.errorRemovingMember'));
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await teamService.updateMemberRole(teamId, memberId, newRole);
      successToast(t('teamDashboard.roleUpdated'));
      loadData();
    } catch (err) {
      errorToast(t('teamDashboard.errorUpdatingRole'));
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setAddTaskValidated(true);
    if (!selectedTaskId) return;
    try {
      await teamService.addTaskToTeam(teamId, selectedTaskId);
      successToast(t('teamDashboard.taskAddedToTeam'));
      setShowAddTaskModal(false);
      setSelectedTaskId("");
      setAddTaskValidated(false);
      loadData();
      if (activeTab === "tasks") setTasksRefreshKey(k => k + 1);
    } catch (err) {
      errorToast(t('teamDashboard.errorAddingTask'));
    }
  };

  const handleReassign = async (e) => {
    e.preventDefault();
    setReassignValidated(true);
    if (!reassignTask || !reassignTarget) return;
    try {
      await teamService.assignTask(teamId, reassignTask.id, reassignTarget);
      successToast(
        t('teamDashboard.taskReassigned', { taskName: reassignTask.nameOfTask, member: reassignTarget })
      );
      setShowReassignModal(false);
      setReassignTask(null);
      setReassignTarget("");
      setReassignValidated(false);
      loadData();
      if (activeTab === "tasks") setTasksRefreshKey(k => k + 1);
    } catch (err) {
      errorToast(t('teamDashboard.errorReassigningTask'));
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
      successToast(t('teamDashboard.teamDeleted'));
      navigate("/home/teams");
    } catch (err) {
      errorToast(t('teamDashboard.errorDeletingTeam'));
    }
  };

  const handleEditTeamSave = async (formData) => {
    await teamService.updateTeam(teamId, formData);
    setShowEditTeamModal(false);
    loadData();
  };

  const openEditTeamModal = () => {
    setShowEditTeamModal(true);
  };

  const handleLeaveTeam = async () => {
    try {
      await teamService.leaveTeam(teamId);
      successToast(t('teamDashboard.youLeftTeam'));
      navigate("/home/teams");
    } catch (err) {
      errorToast(err?.response?.data?.message || t('teamDashboard.errorLeavingTeam'));
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      await teamService.cancelInvitation(teamId, invitationId);
      successToast(t('teamDashboard.invitationCancelled'));
      loadInvitations();
    } catch (err) {
      errorToast(t('teamDashboard.errorCancellingInvitation'));
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
        <p className="text-muted">{t('teamDashboard.teamNotFound')}</p>
        <Button variant="primary" onClick={() => navigate("/home/teams")}>
          {t('teamDashboard.backToTeams')}
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
                {t('teamDashboard.teamDetails')}
              </h1>
              <p className="text-muted mb-0">{t('teamDashboard.teamOverview')}</p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  loadData();
                  if (activeTab === "tasks") setTasksRefreshKey(k => k + 1);
                  if (activeTab === "history") setHistoryRefreshKey(k => k + 1);
                  if (activeTab === "invitations") loadInvitations();
                }}
                className="rounded-3 shadow-sm"
                title={t('teamDashboard.refresh')}
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
                title={t('teamDashboard.addTask')}
              >
                <i className="bi bi-plus-lg"></i><span className="d-none d-sm-inline ms-1">{t('teamDashboard.addTask')}</span>
              </Button>
              {isAdmin && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                  className="rounded-3 shadow-sm"
                  title={t('teamDashboard.inviteMember')}
                >
                  <i className="bi bi-person-plus"></i><span className="d-none d-sm-inline ms-1">{t('teamDashboard.invite')}</span>
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={openEditTeamModal}
                  className="rounded-3 shadow-sm"
                  title={t('teamDashboard.editTeam')}
                >
                  <i className="bi bi-pencil"></i><span className="d-none d-sm-inline ms-1">{t('teamDashboard.edit')}</span>
                </Button>
              )}
              {isAdmin ? (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowDeleteTeamModal(true)}
                  className="rounded-3 shadow-sm"
                  title={t('teamDashboard.deleteTeam')}
                >
                  <i className="bi bi-trash"></i><span className="d-none d-sm-inline ms-1">{t('teamDashboard.delete')}</span>
                </Button>
              ) : (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowLeaveTeamModal(true)}
                  className="rounded-3 shadow-sm"
                  title={t('teamDashboard.leaveTeam')}
                >
                  <i className="bi bi-box-arrow-right"></i><span className="d-none d-sm-inline ms-1">{t('teamDashboard.leave')}</span>
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
                <small>{t('teamDashboard.teamId', { id: team.id })}</small>
              </Stack>
            </div>
            <Badge
              bg="light"
              text="dark"
              className="px-4 py-2 rounded-pill"
              style={{ fontSize: "0.9rem", fontWeight: "600" }}
            >
              <i className="bi bi-people me-1"></i>
              {memberCount} {memberCount === 1 ? t('teamDashboard.member') : t('teamDashboard.members')}
            </Badge>
          </Stack>

          {dashboard && dashboard.totalTasks > 0 && (
            <div className="mt-3">
              <small className="text-white-50">{t('teamDashboard.progress')}</small>
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
                  {memberCount} {memberCount === 1 ? t('teamDashboard.member') : t('teamDashboard.members')}
                </Badge>

                <Badge
                  bg={isAdmin ? "warning" : "secondary"}
                  className="px-3 py-2 rounded-pill d-flex align-items-center gap-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  <i className="bi bi-shield"></i>
                  {isAdmin ? t('teamDashboard.admin') : t('teamDashboard.member')}
                </Badge>

                {dashboard && (
                  <Badge
                    bg="primary"
                    className="px-3 py-2 rounded-pill d-flex align-items-center gap-1"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <i className="bi bi-list-task"></i>
                    {dashboard.totalTasks} {dashboard.totalTasks === 1 ? t('teamDashboard.task') : t('teamDashboard.tasks')}
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
                    <h6 className="mb-1 text-muted">{t('teamDashboard.created')}</h6>
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
                  {t('teamDashboard.description')}
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
                      {!showMore ? t('teamDashboard.showMore') : t('teamDashboard.showLess')}
                    </Button>
                  </>
                )
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-file-text text-muted d-block mb-2" style={{ fontSize: "3rem" }}></i>
                  <p className="text-muted mb-0">{t('teamDashboard.noDescription')}</p>
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
        <Tab eventKey="dashboard" title={<><i className="bi bi-speedometer2 me-1"></i>{t('teamDashboard.dashboard')}</>}>
          <DashboardTab
            dashboard={dashboard}
            team={team}
            isAdmin={isAdmin}
            maxPending={maxPending}
            onRoleChange={handleRoleChange}
            onRemoveMember={openRemoveModal}
          />
        </Tab>

        <Tab eventKey="tasks" title={<><i className="bi bi-list-task me-1"></i>{t('teamDashboard.tasks')}</>}>
          <TasksTab
            teamId={teamId}
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
            refreshKey={tasksRefreshKey}
          />
        </Tab>

        {isAdmin && (
          <Tab eventKey="history" title={<><i className="bi bi-clock-history me-1"></i>{t('teamDashboard.history')}</>}>
            <HistoryTab teamId={teamId} refreshKey={historyRefreshKey} />
          </Tab>
        )}

        {isAdmin && (
          <Tab eventKey="invitations" title={<><i className="bi bi-envelope me-1"></i>{t('teamDashboard.invitations')}</>}>
            <InvitationsTab
              invitations={invitations}
              onCancelInvitation={handleCancelInvitation}
            />
          </Tab>
        )}
      </Tabs>

      {/* ===== Invite Member Modal ===== */}
      <Modal show={showInviteModal} onHide={() => { setShowInviteModal(false); setInviteValidated(false); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-plus me-2"></i>{t('teamDashboard.inviteMemberTitle')}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleInvite}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>{t('teamDashboard.username')}</Form.Label>
              <Form.Control
                type="text"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder={t('teamDashboard.usernamePlaceholder')}
                required
                autoFocus
                isInvalid={inviteValidated && (!inviteUsername || inviteUsername.trim() === "")}
              />
              <Form.Control.Feedback type="invalid">
                {t('teamDashboard.usernameRequired')}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {t('teamDashboard.inviteHelperText')}
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowInviteModal(false); setInviteValidated(false); }}>
              {t('teamDashboard.cancel')}
            </Button>
            <Button type="submit" variant="primary">
              <i className="bi bi-send me-1"></i>{t('teamDashboard.sendInvitation')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===== Reassign Task Modal ===== */}
      <Modal show={showReassignModal} onHide={() => { setShowReassignModal(false); setReassignValidated(false); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-arrow-left-right me-2"></i>{t('teamDashboard.reassignTask')}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReassign}>
          <Modal.Body>
            {reassignTask && (
              <>
                <div className="mb-3 p-2 bg-body-tertiary rounded">
                  <small className="text-muted">{t('teamDashboard.taskLabel')}</small>
                  <p className="mb-0 fw-medium">{reassignTask.nameOfTask}</p>
                  {reassignTask.user && (
                    <small className="text-muted">
                      {t('teamDashboard.currentOwner')}<strong>{reassignTask.user}</strong>
                    </small>
                  )}
                </div>
                <Form.Group>
                  <Form.Label>{t('teamDashboard.reassignTo')}</Form.Label>
                  <Form.Select
                    value={reassignTarget}
                    onChange={(e) => setReassignTarget(e.target.value)}
                    required
                    isInvalid={reassignValidated && !reassignTarget}
                  >
                    <option value="">{t('teamDashboard.selectMember')}</option>
                    {team.members &&
                      team.members
                        .filter((m) => m.username !== reassignTask.user)
                        .map((m) => (
                          <option key={m.id} value={m.username}>
                            {m.username} ({m.role === "ADMIN" ? t('teamDashboard.admin') : t('teamDashboard.member')})
                          </option>
                        ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {t('teamDashboard.selectMemberRequired')}
                  </Form.Control.Feedback>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowReassignModal(false); setReassignValidated(false); }}>
              {t('teamDashboard.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={!reassignTarget}>
              <i className="bi bi-arrow-left-right me-1"></i>{t('teamDashboard.reassign')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===== Remove Member Confirmation Modal ===== */}
      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-x me-2 text-danger"></i>{t('teamDashboard.removeMember')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {memberToRemove && (
            <p>
              {t('teamDashboard.removeMemberConfirm', { username: memberToRemove.username })}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            {t('teamDashboard.cancel')}
          </Button>
          <Button variant="danger" onClick={handleRemoveMember}>
            <i className="bi bi-person-x me-1"></i>{t('teamDashboard.remove')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== Add Task Modal ===== */}
      <Modal show={showAddTaskModal} onHide={() => { setShowAddTaskModal(false); setAddTaskValidated(false); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('teamDashboard.addTaskToTeam')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddTask}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>{t('teamDashboard.selectTask')}</Form.Label>
              <Form.Select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                required
                isInvalid={addTaskValidated && !selectedTaskId}
              >
                <option value="">{t('teamDashboard.selectTaskPlaceholder')}</option>
                {userTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.nameOfTask}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {t('teamDashboard.selectTaskRequired')}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {t('teamDashboard.addTaskHelperText')}
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowAddTaskModal(false); setAddTaskValidated(false); }}>
              {t('teamDashboard.cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {t('teamDashboard.addToTeam')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===== Delete Team Confirmation Modal ===== */}
      <Modal show={showDeleteTeamModal} onHide={() => setShowDeleteTeamModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-trash me-2 text-danger"></i>{t('teamDashboard.deleteTeamTitle')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {t('teamDashboard.deleteTeamConfirm', { teamName: team.name })}
          </p>
          <p className="text-danger mb-0">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {t('teamDashboard.cannotBeUndone')}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteTeamModal(false)}>
            {t('teamDashboard.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteTeam}>
            <i className="bi bi-trash me-1"></i>{t('teamDashboard.deleteTeam')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== Edit Team Modal ===== */}
      <NewEditTeam
        show={showEditTeamModal}
        handleClose={() => setShowEditTeamModal(false)}
        onSave={handleEditTeamSave}
        editOrNew={true}
        initialData={team}
        refreshTeams={loadData}
      />

      {/* ===== Leave Team Confirmation Modal ===== */}
      <Modal show={showLeaveTeamModal} onHide={() => setShowLeaveTeamModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-box-arrow-right me-2 text-danger"></i>{t('teamDashboard.leaveTeamTitle')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {t('teamDashboard.leaveTeamConfirm', { teamName: team.name })}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLeaveTeamModal(false)}>
            {t('teamDashboard.cancel')}
          </Button>
          <Button variant="danger" onClick={handleLeaveTeam}>
            <i className="bi bi-box-arrow-right me-1"></i>{t('teamDashboard.leaveTeam')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeamDashboard;
