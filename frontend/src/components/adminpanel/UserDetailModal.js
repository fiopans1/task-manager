import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Table,
  Form,
  Button,
  Badge,
  Tab,
  Tabs,
  Modal,
  Spinner,
  Collapse,
  Container,
} from "react-bootstrap";
import adminService from "../../services/adminService";
import { successToast, errorToast } from "../common/Noty";
import ConfirmModal from "./ConfirmModal";
import dayjs from "dayjs";

const priorityOptions = ["LOW", "MIN", "MEDIUM", "HIGH", "CRITICAL"];
const statusOptions = ["COMPLETED", "CANCELLED", "IN_PROGRESS", "NEW", "PAUSSED"];

const getStateBadge = (state) => {
  const variants = {
    NEW: "primary",
    IN_PROGRESS: "info",
    COMPLETED: "success",
    CANCELLED: "secondary",
    PAUSSED: "warning",
  };
  return <Badge bg={variants[state] || "secondary"}>{state}</Badge>;
};

const getPriorityBadge = (priority) => {
  const variants = {
    HIGH: "danger",
    CRITICAL: "danger",
    MEDIUM: "warning",
    LOW: "info",
    MIN: "secondary",
  };
  return <Badge bg={variants[priority] || "secondary"}>{priority}</Badge>;
};

const UserDetailModal = ({ show, onHide, user }) => {
  const [userTasks, setUserTasks] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [detailTab, setDetailTab] = useState("tasks");
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Edit task modal
  const [showEditTask, setShowEditTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isEvent, setIsEvent] = useState(false);
  const [startDateField, setStartDateField] = useState("");
  const [startTimeField, setStartTimeField] = useState("");
  const [endDateField, setEndDateField] = useState("");
  const [endTimeField, setEndTimeField] = useState("");

  // Edit team modal
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  // Confirm modal
  const [confirmConfig, setConfirmConfig] = useState({ show: false });

  const loadDetails = useCallback(async () => {
    if (!user) return;
    setLoadingDetails(true);
    try {
      const [tasks, lists, teams] = await Promise.all([
        adminService.getUserTasks(user.id),
        adminService.getUserLists(user.id),
        adminService.getUserTeams(user.id),
      ]);
      setUserTasks(tasks);
      setUserLists(lists);
      setUserTeams(teams);
    } catch (error) {
      errorToast("Error loading user details");
    } finally {
      setLoadingDetails(false);
    }
  }, [user]);

  useEffect(() => {
    if (show && user) {
      loadDetails();
    }
  }, [show, user, loadDetails]);

  // ===== TASK ACTIONS =====
  const handleEditTask = (task) => {
    setEditingTask({ ...task });
    setIsEvent(task.isEvent || false);
    if (task.isEvent && task.startDate) {
      const start = dayjs(task.startDate);
      setStartDateField(start.format("YYYY-MM-DD"));
      setStartTimeField(start.format("HH:mm"));
    } else {
      setStartDateField("");
      setStartTimeField("");
    }
    if (task.isEvent && task.endDate) {
      const end = dayjs(task.endDate);
      setEndDateField(end.format("YYYY-MM-DD"));
      setEndTimeField(end.format("HH:mm"));
    } else {
      setEndDateField("");
      setEndTimeField("");
    }
    setShowEditTask(true);
  };

  const handleSaveTask = async () => {
    if (!user || !editingTask) return;
    try {
      const taskData = { ...editingTask, isEvent };
      if (isEvent) {
        if (startDateField && startTimeField) {
          taskData.startDate = dayjs(`${startDateField}T${startTimeField}`).toISOString();
        }
        if (endDateField && endTimeField) {
          taskData.endDate = dayjs(`${endDateField}T${endTimeField}`).toISOString();
        }
      }
      const updated = await adminService.updateUserTask(user.id, editingTask.id, taskData);
      setUserTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setShowEditTask(false);
      successToast("Task updated");
    } catch (error) {
      errorToast("Error updating task");
    }
  };

  const handleDeleteTask = (taskId) => {
    setConfirmConfig({
      show: true,
      title: "Delete Task",
      message: "Are you sure you want to delete this task? This action cannot be undone.",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await adminService.deleteUserTask(user.id, taskId);
          setUserTasks((prev) => prev.filter((t) => t.id !== taskId));
          successToast("Task deleted");
        } catch (error) {
          errorToast("Error deleting task");
        }
        setConfirmConfig({ show: false });
      },
    });
  };

  // ===== LIST ACTIONS =====
  const handleDeleteList = (listId) => {
    setConfirmConfig({
      show: true,
      title: "Delete List",
      message: "Are you sure you want to delete this list? Tasks in the list will be unlinked, not deleted.",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await adminService.deleteUserList(user.id, listId);
          setUserLists((prev) => prev.filter((l) => l.id !== listId));
          successToast("List deleted");
        } catch (error) {
          errorToast("Error deleting list");
        }
        setConfirmConfig({ show: false });
      },
    });
  };

  // ===== TEAM ACTIONS =====
  const handleEditTeam = (team) => {
    setEditingTeam({ ...team });
    setShowEditTeam(true);
  };

  const handleSaveTeam = async () => {
    if (!editingTeam) return;
    try {
      const updated = await adminService.updateTeam(editingTeam.id, editingTeam);
      setUserTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setShowEditTeam(false);
      successToast("Team updated");
    } catch (error) {
      errorToast("Error updating team");
    }
  };

  const handleDeleteTeam = (teamId) => {
    setConfirmConfig({
      show: true,
      title: "Delete Team",
      message: "Are you sure you want to delete this team? All members will be removed.",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await adminService.deleteTeam(teamId);
          setUserTeams((prev) => prev.filter((t) => t.id !== teamId));
          successToast("Team deleted");
        } catch (error) {
          errorToast("Error deleting team");
        }
        setConfirmConfig({ show: false });
      },
    });
  };

  if (!user) return null;

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-circle me-2"></i>
            {user.username}
            {user.blocked && (
              <Badge bg="danger" className="ms-2">Blocked</Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* User info summary */}
          <div className="d-flex flex-wrap gap-3 mb-3">
            <div><strong>Email:</strong> {user.email}</div>
            <div>
              <strong>Roles:</strong>{" "}
              {user.roles?.map((r, i) => (
                <Badge key={i} bg={r === "ADMIN" ? "danger" : "primary"} className="me-1">{r}</Badge>
              ))}
            </div>
            <div><strong>Created:</strong> {user.creationDate ? new Date(user.creationDate).toLocaleDateString() : "—"}</div>
          </div>

          {loadingDetails ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading user details...</p>
            </div>
          ) : (
            <Tabs activeKey={detailTab} onSelect={setDetailTab} className="mb-3">
              <Tab eventKey="tasks" title={`Tasks (${userTasks.length})`}>
                {/* Mobile: card layout; Desktop: table */}
                <div className="d-none d-md-block">
                  <Table responsive hover size="sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>State</th>
                        <th>Priority</th>
                        <th>List</th>
                        <th>Team</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTasks.map((task) => (
                        <tr key={task.id}>
                          <td>{task.nameOfTask}</td>
                          <td>{getStateBadge(task.state)}</td>
                          <td>{getPriorityBadge(task.priority)}</td>
                          <td>{task.listName || "—"}</td>
                          <td>{task.teamName || "—"}</td>
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditTask(task)}>
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTask(task.id)}>
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {userTasks.length === 0 && (
                        <tr><td colSpan="6" className="text-center text-muted py-3">No tasks</td></tr>
                      )}
                    </tbody>
                  </Table>
                </div>
                {/* Mobile card layout */}
                <div className="d-md-none">
                  {userTasks.map((task) => (
                    <div key={task.id} className="border rounded-3 p-3 mb-2">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong>{task.nameOfTask}</strong>
                        <div>
                          <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditTask(task)}>
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTask(task.id)}>
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        {getStateBadge(task.state)}
                        {getPriorityBadge(task.priority)}
                        {task.listName && <Badge bg="light" text="dark">{task.listName}</Badge>}
                        {task.teamName && <Badge bg="light" text="dark">{task.teamName}</Badge>}
                      </div>
                    </div>
                  ))}
                  {userTasks.length === 0 && <p className="text-center text-muted py-3">No tasks</p>}
                </div>
              </Tab>

              <Tab eventKey="lists" title={`Lists (${userLists.length})`}>
                <div className="d-none d-md-block">
                  <Table responsive hover size="sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Total Tasks</th>
                        <th>Completed</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userLists.map((list) => (
                        <tr key={list.id}>
                          <td>
                            <span className="d-inline-block rounded-circle me-2" style={{ width: 12, height: 12, backgroundColor: list.color || "#6c757d" }}></span>
                            {list.nameOfList}
                          </td>
                          <td className="text-truncate" style={{ maxWidth: 200 }}>{list.descriptionOfList || "—"}</td>
                          <td>{list.totalElements}</td>
                          <td>{list.completedElements}</td>
                          <td>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteList(list.id)}>
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {userLists.length === 0 && (
                        <tr><td colSpan="5" className="text-center text-muted py-3">No lists</td></tr>
                      )}
                    </tbody>
                  </Table>
                </div>
                <div className="d-md-none">
                  {userLists.map((list) => (
                    <div key={list.id} className="border rounded-3 p-3 mb-2">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div className="d-flex align-items-center">
                          <span className="d-inline-block rounded-circle me-2" style={{ width: 12, height: 12, backgroundColor: list.color || "#6c757d" }}></span>
                          <strong>{list.nameOfList}</strong>
                        </div>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteList(list.id)}>
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                      <small className="text-muted">{list.totalElements} tasks, {list.completedElements} completed</small>
                    </div>
                  ))}
                  {userLists.length === 0 && <p className="text-center text-muted py-3">No lists</p>}
                </div>
              </Tab>

              <Tab eventKey="teams" title={`Teams (${userTeams.length})`}>
                <div className="d-none d-md-block">
                  <Table responsive hover size="sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Members</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTeams.map((team) => (
                        <tr key={team.id}>
                          <td className="fw-semibold">{team.name}</td>
                          <td className="text-truncate" style={{ maxWidth: 200 }}>{team.description || "—"}</td>
                          <td>{team.memberCount}</td>
                          <td>{team.creationDate ? new Date(team.creationDate).toLocaleDateString() : "—"}</td>
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditTeam(team)}>
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTeam(team.id)}>
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {userTeams.length === 0 && (
                        <tr><td colSpan="5" className="text-center text-muted py-3">No teams</td></tr>
                      )}
                    </tbody>
                  </Table>
                </div>
                <div className="d-md-none">
                  {userTeams.map((team) => (
                    <div key={team.id} className="border rounded-3 p-3 mb-2">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <strong>{team.name}</strong>
                        <div>
                          <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditTeam(team)}>
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTeam(team.id)}>
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>
                      <small className="text-muted">{team.memberCount} members</small>
                    </div>
                  ))}
                  {userTeams.length === 0 && <p className="text-center text-muted py-3">No teams</p>}
                </div>
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Task Modal — matches existing EditTask.js style */}
      <Modal show={showEditTask} onHide={() => setShowEditTask(false)} size="lg" centered className="task-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary">Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {editingTask && (
            <Container>
              <Col>
                <Form>
                  <Form.Group className="mb-4" controlId="adminEditTaskName">
                    <Form.Label className="text-secondary fw-medium">Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Name of task"
                      value={editingTask.nameOfTask || ""}
                      onChange={(e) => setEditingTask({ ...editingTask, nameOfTask: e.target.value })}
                      className="shadow-sm rounded-3 border-light-subtle"
                    />
                  </Form.Group>
                  <Row className="mb-4">
                    <Col>
                      <Form.Group controlId="adminEditPriority">
                        <Form.Label className="text-secondary fw-medium">Priority</Form.Label>
                        <Form.Select
                          value={editingTask.priority || "MEDIUM"}
                          onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                          className="shadow-sm rounded-3 border-light-subtle"
                        >
                          {priorityOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId="adminEditStatus">
                        <Form.Label className="text-secondary fw-medium">Status</Form.Label>
                        <Form.Select
                          value={editingTask.state || "NEW"}
                          onChange={(e) => setEditingTask({ ...editingTask, state: e.target.value })}
                          className="shadow-sm rounded-3 border-light-subtle"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Check
                    type="switch"
                    id="admin-edit-event-switch"
                    label="Is an Event?"
                    checked={isEvent}
                    onChange={() => setIsEvent(!isEvent)}
                    className="mb-3 form-switch-lg text-secondary fw-medium"
                  />
                  <Collapse in={isEvent}>
                    <Container className="mb-4 bg-body-tertiary rounded-3 p-3 border border-light-subtle">
                      <Row>
                        <Form.Group controlId="adminEditStartDate" className="mb-3" style={{ width: "100%" }}>
                          <Form.Label className="text-secondary fw-medium">Start Event</Form.Label>
                          <Row>
                            <Col>
                              <Form.Control type="date" value={startDateField} onChange={(e) => setStartDateField(e.target.value)} className="shadow-sm rounded-3 border-light-subtle" />
                            </Col>
                            <Col>
                              <Form.Control type="time" value={startTimeField} onChange={(e) => setStartTimeField(e.target.value)} className="shadow-sm rounded-3 border-light-subtle" />
                            </Col>
                          </Row>
                        </Form.Group>
                        <Form.Group controlId="adminEditEndDate" className="mb-3" style={{ width: "100%" }}>
                          <Form.Label className="text-secondary fw-medium">End Event</Form.Label>
                          <Row>
                            <Col>
                              <Form.Control type="date" value={endDateField} onChange={(e) => setEndDateField(e.target.value)} className="shadow-sm rounded-3 border-light-subtle" />
                            </Col>
                            <Col>
                              <Form.Control type="time" value={endTimeField} onChange={(e) => setEndTimeField(e.target.value)} className="shadow-sm rounded-3 border-light-subtle" />
                            </Col>
                          </Row>
                        </Form.Group>
                      </Row>
                    </Container>
                  </Collapse>
                  <Form.Group className="mb-4" controlId="adminEditDescription">
                    <Form.Label className="text-secondary fw-medium">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Description....."
                      value={editingTask.descriptionOfTask || ""}
                      onChange={(e) => setEditingTask({ ...editingTask, descriptionOfTask: e.target.value })}
                      className="shadow-sm rounded-3 border-light-subtle"
                    />
                  </Form.Group>
                </Form>
              </Col>
            </Container>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowEditTask(false)} className="rounded-3 px-4 fw-medium">Cancel</Button>
          <Button variant="primary" onClick={handleSaveTask} className="rounded-3 px-4 fw-medium">Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Team Modal */}
      <Modal show={showEditTeam} onHide={() => setShowEditTeam(false)} centered className="task-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary">Edit Team</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {editingTeam && (
            <Container>
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label className="text-secondary fw-medium">Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Team name"
                    value={editingTeam.name || ""}
                    onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    className="shadow-sm rounded-3 border-light-subtle"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-secondary fw-medium">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Team description..."
                    value={editingTeam.description || ""}
                    onChange={(e) => setEditingTeam({ ...editingTeam, description: e.target.value })}
                    className="shadow-sm rounded-3 border-light-subtle"
                  />
                </Form.Group>
              </Form>
            </Container>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowEditTeam(false)} className="rounded-3 px-4 fw-medium">Cancel</Button>
          <Button variant="primary" onClick={handleSaveTeam} className="rounded-3 px-4 fw-medium">Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        show={confirmConfig.show}
        onHide={() => setConfirmConfig({ show: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
      />
    </>
  );
};

export default UserDetailModal;
