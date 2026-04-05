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
import { useServerInfiniteScroll } from "../../hooks/useInfiniteScroll";

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
  const [detailTab, setDetailTab] = useState("tasks");
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);
  const [listsRefreshKey, setListsRefreshKey] = useState(0);
  const [teamsRefreshKey, setTeamsRefreshKey] = useState(0);

  // Reused modals
  const [showEditTask, setShowEditTask] = useState(false);
  const [editTaskData, setEditTaskData] = useState({});
  const [showEditList, setShowEditList] = useState(false);
  const [editListData, setEditListData] = useState({});
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [editTeamData, setEditTeamData] = useState({});

  // Confirm modal
  const [confirmConfig, setConfirmConfig] = useState({ show: false });

  useEffect(() => {
    if (show && user) {
      setDetailTab("tasks");
      setTasksRefreshKey((k) => k + 1);
      setListsRefreshKey((k) => k + 1);
      setTeamsRefreshKey((k) => k + 1);
    }
  }, [show, user]);

  // ===== TASK ACTIONS =====
  const handleEditTask = async (task) => {
    try {
      const fullTask = await taskService.getTaskById(task.id);
      setEditTaskData(fullTask);
      setShowEditTask(true);
    } catch (error) {
      errorToast("Error loading task details");
    }
  };

  const refreshTasksAfterEdit = () => {
    setTasksRefreshKey((k) => k + 1);
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
          setTasksRefreshKey((k) => k + 1);
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

  const refreshListsAfterEdit = () => {
    setListsRefreshKey((k) => k + 1);
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
          setListsRefreshKey((k) => k + 1);
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
    setTeamsRefreshKey((k) => k + 1);
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
          setTeamsRefreshKey((k) => k + 1);
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

          <Tabs activeKey={detailTab} onSelect={setDetailTab} className="mb-3">
            <Tab eventKey="tasks" title="Tasks">
              <AdminTasksTabContent
                userId={user.id}
                refreshKey={tasksRefreshKey}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            </Tab>

            <Tab eventKey="lists" title="Lists">
              <AdminListsTabContent
                userId={user.id}
                refreshKey={listsRefreshKey}
                onEditList={handleEditList}
                onDeleteList={handleDeleteList}
              />
            </Tab>

            <Tab eventKey="teams" title="Teams">
              <AdminTeamsTabContent
                userId={user.id}
                refreshKey={teamsRefreshKey}
                onEditTeam={handleEditTeamOpen}
                onDeleteTeam={handleDeleteTeam}
              />
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

// ===== Paginated sub-components for admin tabs =====

const AdminTasksTabContent = ({ userId, refreshKey, onEditTask, onDeleteTask }) => {
  const fetchPage = useCallback(async (page, size) => {
    return adminService.fetchUserTasksPage(userId, page, size);
  }, [userId]);

  const { items: tasks, initialLoading, LoadMoreSpinner } = useServerInfiniteScroll(
    fetchPage, 50, [userId, refreshKey]
  );

  if (initialLoading) {
    return <div className="text-center py-5"><Spinner animation="border" /><p className="mt-2">Loading tasks...</p></div>;
  }

  return (
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
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.nameOfTask}</td>
                <td>{getStateBadge(task.state)}</td>
                <td>{getPriorityBadge(task.priority)}</td>
                <td>{task.listName || "—"}</td>
                <td>{task.teamName || "—"}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onEditTask(task)}>
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => onDeleteTask(task.id)}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr><td colSpan="6" className="text-center text-muted py-3">No tasks</td></tr>
            )}
          </tbody>
        </Table>
      </div>
      <div className="d-md-none">
        {tasks.map((task) => (
          <div key={task.id} className="border rounded-3 p-3 mb-2">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <strong>{task.nameOfTask}</strong>
              <div>
                <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onEditTask(task)}>
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => onDeleteTask(task.id)}>
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
        {tasks.length === 0 && <p className="text-center text-muted py-3">No tasks</p>}
      </div>
      <LoadMoreSpinner />
    </>
  );
};

const AdminListsTabContent = ({ userId, refreshKey, onEditList, onDeleteList }) => {
  const fetchPage = useCallback(async (page, size) => {
    return adminService.fetchUserListsPage(userId, page, size);
  }, [userId]);

  const { items: lists, initialLoading, LoadMoreSpinner } = useServerInfiniteScroll(
    fetchPage, 50, [userId, refreshKey]
  );

  if (initialLoading) {
    return <div className="text-center py-5"><Spinner animation="border" /><p className="mt-2">Loading lists...</p></div>;
  }

  return (
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
            {lists.map((list) => (
              <tr key={list.id}>
                <td>
                  <span className="d-inline-block rounded-circle me-2" style={{ width: 12, height: 12, backgroundColor: list.color || "#6c757d" }}></span>
                  {list.nameOfList}
                </td>
                <td className="text-truncate" style={{ maxWidth: 200 }}>{list.descriptionOfList || "—"}</td>
                <td>{list.totalElements}</td>
                <td>{list.completedElements}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onEditList(list)}>
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => onDeleteList(list.id)}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
            {lists.length === 0 && (
              <tr><td colSpan="5" className="text-center text-muted py-3">No lists</td></tr>
            )}
          </tbody>
        </Table>
      </div>
      <div className="d-md-none">
        {lists.map((list) => (
          <div key={list.id} className="border rounded-3 p-3 mb-2">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <div className="d-flex align-items-center">
                <span className="d-inline-block rounded-circle me-2" style={{ width: 12, height: 12, backgroundColor: list.color || "#6c757d" }}></span>
                <strong>{list.nameOfList}</strong>
              </div>
              <div>
                <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onEditList(list)}>
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => onDeleteList(list.id)}>
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            </div>
            <small className="text-muted">{list.totalElements} tasks, {list.completedElements} completed</small>
          </div>
        ))}
        {lists.length === 0 && <p className="text-center text-muted py-3">No lists</p>}
      </div>
      <LoadMoreSpinner />
    </>
  );
};

const AdminTeamsTabContent = ({ userId, refreshKey, onEditTeam, onDeleteTeam }) => {
  const fetchPage = useCallback(async (page, size) => {
    return adminService.fetchUserTeamsPage(userId, page, size);
  }, [userId]);

  const { items: teams, initialLoading, LoadMoreSpinner } = useServerInfiniteScroll(
    fetchPage, 50, [userId, refreshKey]
  );

  if (initialLoading) {
    return <div className="text-center py-5"><Spinner animation="border" /><p className="mt-2">Loading teams...</p></div>;
  }

  return (
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
            {teams.map((team) => (
              <tr key={team.id}>
                <td className="fw-semibold">{team.name}</td>
                <td className="text-truncate" style={{ maxWidth: 200 }}>{team.description || "—"}</td>
                <td>{team.memberCount}</td>
                <td>{team.creationDate ? new Date(team.creationDate).toLocaleDateString() : "—"}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onEditTeam(team)}>
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => onDeleteTeam(team.id)}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr><td colSpan="5" className="text-center text-muted py-3">No teams</td></tr>
            )}
          </tbody>
        </Table>
      </div>
      <div className="d-md-none">
        {teams.map((team) => (
          <div key={team.id} className="border rounded-3 p-3 mb-2">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <strong>{team.name}</strong>
              <div>
                <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onEditTeam(team)}>
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => onDeleteTeam(team.id)}>
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            </div>
            <small className="text-muted">{team.memberCount} members</small>
          </div>
        ))}
        {teams.length === 0 && <p className="text-center text-muted py-3">No teams</p>}
      </div>
      <LoadMoreSpinner />
    </>
  );
};

export default UserDetailModal;
