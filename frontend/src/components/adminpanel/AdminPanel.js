import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Badge,
  Tab,
  Tabs,
  Modal,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import adminService from "../../services/adminService";
import {
  successToast,
  errorToast,
} from "../common/Noty";

// ===== Subcomponents =====

const UserManagementTab = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userTasks, setUserTasks] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [detailTab, setDetailTab] = useState("tasks");
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Edit task modal
  const [showEditTask, setShowEditTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.searchUsers(searchQuery);
      setUsers(data);
    } catch (error) {
      errorToast("Error loading users");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleBlock = async (userId) => {
    try {
      const updated = await adminService.toggleUserBlock(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, blocked: updated.blocked } : u))
      );
      successToast(
        updated.blocked ? "User blocked successfully" : "User unblocked successfully"
      );
    } catch (error) {
      errorToast("Error toggling user block status");
    }
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
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
  };

  const handleDeleteTask = async (taskId) => {
    if (!selectedUser) return;
    try {
      await adminService.deleteUserTask(selectedUser.id, taskId);
      setUserTasks((prev) => prev.filter((t) => t.id !== taskId));
      successToast("Task deleted");
    } catch (error) {
      errorToast("Error deleting task");
    }
  };

  const handleDeleteList = async (listId) => {
    if (!selectedUser) return;
    try {
      await adminService.deleteUserList(selectedUser.id, listId);
      setUserLists((prev) => prev.filter((l) => l.id !== listId));
      successToast("List deleted");
    } catch (error) {
      errorToast("Error deleting list");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask({ ...task });
    setShowEditTask(true);
  };

  const handleSaveTask = async () => {
    if (!selectedUser || !editingTask) return;
    try {
      const updated = await adminService.updateUserTask(
        selectedUser.id,
        editingTask.id,
        editingTask
      );
      setUserTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setShowEditTask(false);
      successToast("Task updated");
    } catch (error) {
      errorToast("Error updating task");
    }
  };

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
      MEDIUM: "warning",
      LOW: "info",
    };
    return <Badge bg={variants[priority] || "secondary"}>{priority}</Badge>;
  };

  return (
    <>
      {/* Search */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search users by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  <i className="bi bi-search"></i>
                )}
                <span className="ms-2">Search</span>
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Tasks</th>
                <th>Lists</th>
                <th>Teams</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td className="fw-semibold">{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.roles &&
                      user.roles.map((role, i) => (
                        <Badge
                          key={i}
                          bg={role === "ADMIN" ? "danger" : "primary"}
                          className="me-1"
                        >
                          {role}
                        </Badge>
                      ))}
                  </td>
                  <td>{user.taskCount}</td>
                  <td>{user.listCount}</td>
                  <td>{user.teamCount}</td>
                  <td>
                    {user.blocked ? (
                      <Badge bg="danger">Blocked</Badge>
                    ) : (
                      <Badge bg="success">Active</Badge>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-1"
                      onClick={() => handleViewUser(user)}
                      title="View details"
                    >
                      <i className="bi bi-eye"></i>
                    </Button>
                    <Button
                      variant={user.blocked ? "outline-success" : "outline-danger"}
                      size="sm"
                      onClick={() => handleToggleBlock(user.id)}
                      title={user.blocked ? "Unblock" : "Block"}
                    >
                      <i
                        className={`bi ${
                          user.blocked ? "bi-unlock" : "bi-lock"
                        }`}
                      ></i>
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* User Detail Modal */}
      <Modal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-circle me-2"></i>
            {selectedUser?.username}
            {selectedUser?.blocked && (
              <Badge bg="danger" className="ms-2">
                Blocked
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetails ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading user details...</p>
            </div>
          ) : (
            <Tabs
              activeKey={detailTab}
              onSelect={setDetailTab}
              className="mb-3"
            >
              <Tab eventKey="tasks" title={`Tasks (${userTasks.length})`}>
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
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleEditTask(task)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {userTasks.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          No tasks
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Tab>
              <Tab eventKey="lists" title={`Lists (${userLists.length})`}>
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
                          <span
                            className="d-inline-block rounded-circle me-2"
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: list.color || "#6c757d",
                            }}
                          ></span>
                          {list.nameOfList}
                        </td>
                        <td className="text-truncate" style={{ maxWidth: 200 }}>
                          {list.descriptionOfList || "—"}
                        </td>
                        <td>{list.totalElements}</td>
                        <td>{list.completedElements}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteList(list.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {userLists.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          No lists
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Tab>
              <Tab eventKey="teams" title={`Teams (${userTeams.length})`}>
                <Table responsive hover size="sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Members</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userTeams.map((team) => (
                      <tr key={team.id}>
                        <td className="fw-semibold">{team.name}</td>
                        <td className="text-truncate" style={{ maxWidth: 200 }}>
                          {team.description || "—"}
                        </td>
                        <td>{team.memberCount}</td>
                        <td>
                          {team.creationDate
                            ? new Date(team.creationDate).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                    {userTeams.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No teams
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        show={showEditTask}
        onHide={() => setShowEditTask(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingTask && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingTask.nameOfTask || ""}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      nameOfTask: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editingTask.descriptionOfTask || ""}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      descriptionOfTask: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Select
                      value={editingTask.state || "NEW"}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          state: e.target.value,
                        })
                      }
                    >
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="PAUSSED">Paused</option>
                      <option value="CANCELLED">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select
                      value={editingTask.priority || "MEDIUM"}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          priority: e.target.value,
                        })
                      }
                    >
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditTask(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveTask}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const FeatureFlagsTab = () => {
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);
  const [newFeatureName, setNewFeatureName] = useState("");

  const loadFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getFeatureFlags();
      setFeatures(data);
    } catch (error) {
      errorToast("Error loading feature flags");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const handleToggleFeature = async (featureName, currentValue) => {
    try {
      const updated = await adminService.updateFeatureFlag(
        featureName,
        !currentValue
      );
      setFeatures(updated);
      successToast(`Feature "${featureName}" ${!currentValue ? "enabled" : "disabled"}`);
    } catch (error) {
      errorToast("Error updating feature flag");
    }
  };

  const handleAddFeature = async (e) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;
    try {
      const updated = await adminService.updateFeatureFlag(
        newFeatureName.trim(),
        true
      );
      setFeatures(updated);
      setNewFeatureName("");
      successToast(`Feature "${newFeatureName}" added`);
    } catch (error) {
      errorToast("Error adding feature flag");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">
            <i className="bi bi-toggles me-2"></i>Feature Flags
          </h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-3">
            Enable or disable features for all users. Changes take effect when
            users reload the application.
          </p>
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(features).map(([name, enabled]) => (
                <tr key={name}>
                  <td className="fw-semibold">{name}</td>
                  <td>
                    <Badge bg={enabled ? "success" : "secondary"}>
                      {enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </td>
                  <td>
                    <Form.Check
                      type="switch"
                      checked={enabled}
                      onChange={() => handleToggleFeature(name, enabled)}
                      label=""
                    />
                  </td>
                </tr>
              ))}
              {Object.keys(features).length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-3">
                    No feature flags configured
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">
            <i className="bi bi-plus-circle me-2"></i>Add Feature Flag
          </h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddFeature}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Feature name (e.g., calendar, teams, lists)"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
              />
              <Button variant="primary" type="submit">
                <i className="bi bi-plus-lg me-1"></i> Add
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

const SystemMessageTab = () => {
  const [message, setMessage] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getSystemMessage();
        setMessage(data.message || "");
        setEnabled(data.enabled || false);
      } catch (error) {
        errorToast("Error loading system message");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await adminService.updateSystemMessage(message, enabled);
      setMessage(updated.message || "");
      setEnabled(updated.enabled || false);
      successToast("System message updated");
    } catch (error) {
      errorToast("Error saving system message");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white">
        <h5 className="mb-0">
          <i className="bi bi-megaphone me-2"></i>System Message
        </h5>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-3">
          Configure a message that will be displayed to all users when they open
          the application. Useful for announcements, maintenance notices, or
          server notifications.
        </p>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Enable Message</Form.Label>
          <Form.Check
            type="switch"
            id="system-message-switch"
            label={enabled ? "Message is active" : "Message is inactive"}
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Message Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Enter the message to display to users..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Form.Group>

        {message && (
          <Alert variant="info" className="mb-3">
            <Alert.Heading className="h6">
              <i className="bi bi-eye me-2"></i>Preview
            </Alert.Heading>
            {message}
          </Alert>
        )}

        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Saving...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-2"></i>
              Save Message
            </>
          )}
        </Button>
      </Card.Body>
    </Card>
  );
};

// ===== Main AdminPanel Component =====

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <Container
      fluid
      className="p-0"
      style={{ height: "100%", overflow: "auto" }}
    >
      <div className="p-3 p-md-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="fw-bold">
            <i className="bi bi-shield-lock me-2"></i>
            Administration Panel
          </h2>
          <p className="text-muted mb-0">
            Manage users, feature flags, and system settings
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onSelect={setActiveTab}
          className="mb-4"
        >
          <Tab
            eventKey="users"
            title={
              <span>
                <i className="bi bi-people me-1"></i> Users
              </span>
            }
          >
            <div className="mt-3">
              <UserManagementTab />
            </div>
          </Tab>
          <Tab
            eventKey="features"
            title={
              <span>
                <i className="bi bi-toggles me-1"></i> Features
              </span>
            }
          >
            <div className="mt-3">
              <FeatureFlagsTab />
            </div>
          </Tab>
          <Tab
            eventKey="message"
            title={
              <span>
                <i className="bi bi-megaphone me-1"></i> System Message
              </span>
            }
          >
            <div className="mt-3">
              <SystemMessageTab />
            </div>
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
};

export default AdminPanel;
