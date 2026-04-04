import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Badge,
  Tab,
  Tabs,
  Modal,
  Spinner,
} from "react-bootstrap";
import adminService from "../../services/adminService";
import taskService from "../../services/taskService";
import listService from "../../services/listService";
import teamService from "../../services/teamService";
import { successToast, errorToast } from "../common/Noty";
import ConfirmModal from "./ConfirmModal";
import EditTask from "../tasks/EditTask";
import NewEditLists from "../lists/NewEditLists";
import EditTeam from "../teams/EditTeam";

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
  const [loadedTabs, setLoadedTabs] = useState({});

  // Reused modals
  const [showEditTask, setShowEditTask] = useState(false);
  const [editTaskData, setEditTaskData] = useState({});
  const [showEditList, setShowEditList] = useState(false);
  const [editListData, setEditListData] = useState({});
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [editTeamData, setEditTeamData] = useState({});

  // Confirm modal
  const [confirmConfig, setConfirmConfig] = useState({ show: false });

  // Load summary data for a specific tab only when first opened
  const loadTabData = useCallback(async (tab) => {
    if (!user) return;
    try {
      if (tab === "tasks") {
        const tasks = await adminService.getUserTasks(user.id);
        setUserTasks(tasks);
      } else if (tab === "lists") {
        const lists = await adminService.getUserLists(user.id);
        setUserLists(lists);
      } else if (tab === "teams") {
        const teams = await adminService.getUserTeams(user.id);
        setUserTeams(teams);
      }
      setLoadedTabs((prev) => ({ ...prev, [tab]: true }));
    } catch (error) {
      errorToast("Error loading " + tab);
    }
  }, [user]);

  // Load the initial tab when modal opens
  useEffect(() => {
    if (show && user) {
      setLoadedTabs({});
      setDetailTab("tasks");
      loadTabData("tasks");
    }
  }, [show, user, loadTabData]);

  // Load tab data when switching tabs (lazy load)
  const handleTabSelect = (tab) => {
    setDetailTab(tab);
    if (!loadedTabs[tab]) {
      loadTabData(tab);
    }
  };

  // ===== TASK ACTIONS =====
  const handleEditTask = async (task) => {
    try {
      // Load full task details from existing endpoint before editing
      const fullTask = await taskService.getTaskById(task.id);
      setEditTaskData(fullTask);
      setShowEditTask(true);
    } catch (error) {
      errorToast("Error loading task details");
    }
  };

  const refreshTasksAfterEdit = async () => {
    try {
      const tasks = await adminService.getUserTasks(user.id);
      setUserTasks(tasks);
    } catch (error) {
      errorToast("Error refreshing tasks");
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
          await taskService.deleteTask(taskId);
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
  const handleEditList = (list) => {
    setEditListData(list);
    setShowEditList(true);
  };

  const refreshListsAfterEdit = async () => {
    try {
      const lists = await adminService.getUserLists(user.id);
      setUserLists(lists);
    } catch (error) {
      errorToast("Error refreshing lists");
    }
  };

  const handleDeleteList = (listId) => {
    setConfirmConfig({
      show: true,
      title: "Delete List",
      message: "Are you sure you want to delete this list? Tasks in the list will be unlinked, not deleted.",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await listService.deleteList(listId);
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
  const handleEditTeamOpen = (team) => {
    setEditTeamData(team);
    setShowEditTeam(true);
  };

  const handleSaveTeam = async (formData) => {
    await teamService.updateTeam(editTeamData.id, formData);
    const teams = await adminService.getUserTeams(user.id);
    setUserTeams(teams);
  };

  const handleDeleteTeam = (teamId) => {
    setConfirmConfig({
      show: true,
      title: "Delete Team",
      message: "Are you sure you want to delete this team? All members will be removed.",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await teamService.deleteTeam(teamId);
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

          <Tabs activeKey={detailTab} onSelect={handleTabSelect} className="mb-3">
            <Tab eventKey="tasks" title={`Tasks (${loadedTabs.tasks ? userTasks.length : "..."})`}>
              {!loadedTabs.tasks ? (
                <div className="text-center py-5"><Spinner animation="border" /><p className="mt-2">Loading tasks...</p></div>
              ) : (
                <>
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
                </>
              )}
            </Tab>

            <Tab eventKey="lists" title={`Lists (${loadedTabs.lists ? userLists.length : "..."})`}>
              {!loadedTabs.lists ? (
                <div className="text-center py-5"><Spinner animation="border" /><p className="mt-2">Loading lists...</p></div>
              ) : (
                <>
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
                              <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditList(list)}>
                                <i className="bi bi-pencil"></i>
                              </Button>
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
                          <div>
                            <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditList(list)}>
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteList(list.id)}>
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </div>
                        <small className="text-muted">{list.totalElements} tasks, {list.completedElements} completed</small>
                      </div>
                    ))}
                    {userLists.length === 0 && <p className="text-center text-muted py-3">No lists</p>}
                  </div>
                </>
              )}
            </Tab>

            <Tab eventKey="teams" title={`Teams (${loadedTabs.teams ? userTeams.length : "..."})`}>
              {!loadedTabs.teams ? (
                <div className="text-center py-5"><Spinner animation="border" /><p className="mt-2">Loading teams...</p></div>
              ) : (
                <>
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
                              <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditTeamOpen(team)}>
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
                            <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditTeamOpen(team)}>
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
                </>
              )}
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>

      {/* Reuse existing EditTask modal — no onSave override needed, existing TaskService already allows ADMIN */}
      <EditTask
        show={showEditTask}
        handleClose={() => setShowEditTask(false)}
        refreshTasks={refreshTasksAfterEdit}
        initialData={editTaskData}
      />

      {/* Reuse existing NewEditLists modal (edit mode) — no onSave override needed, existing ListService already allows ADMIN */}
      <NewEditLists
        show={showEditList}
        handleClose={() => setShowEditList(false)}
        refreshLists={refreshListsAfterEdit}
        editOrNew={true}
        initialData={editListData}
      />

      {/* Reuse EditTeam component — uses teamService.updateTeam which now allows global ADMIN */}
      <EditTeam
        show={showEditTeam}
        handleClose={() => setShowEditTeam(false)}
        onSave={handleSaveTeam}
        initialData={editTeamData}
      />

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
