import React, { useState } from "react";
import {
  Card,
  Form,
  Button,
  Badge,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import adminService from "../../services/adminService";
import { successToast, errorToast } from "../common/Noty";
import UserDetailModal from "./UserDetailModal";
import ConfirmModal from "./ConfirmModal";

const UserManagementTab = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ show: false });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await adminService.searchUsers(searchQuery);
      setUsers(data);
    } catch (error) {
      errorToast("Error searching users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = (user) => {
    const action = user.blocked ? "unblock" : "block";
    setConfirmConfig({
      show: true,
      title: `${user.blocked ? "Unblock" : "Block"} User`,
      message: `Are you sure you want to ${action} user "${user.username}"?`,
      confirmText: user.blocked ? "Unblock" : "Block",
      confirmVariant: user.blocked ? "success" : "danger",
      onConfirm: async () => {
        try {
          const updated = await adminService.toggleUserBlock(user.id);
          setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, blocked: updated.blocked } : u))
          );
          successToast(updated.blocked ? "User blocked" : "User unblocked");
        } catch (error) {
          errorToast("Error toggling user block status");
        }
        setConfirmConfig({ show: false });
      },
    });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
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
                placeholder="Search users by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  <i className="bi bi-search"></i>
                )}
                <span className="d-none d-sm-inline ms-2">Search</span>
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* Results — card-based for mobile-friendly layout */}
      {!searched && !loading && (
        <div className="text-center text-muted py-5">
          <i className="bi bi-search fs-1 d-block mb-2"></i>
          <p>Search for users by their username</p>
        </div>
      )}

      {searched && users.length === 0 && !loading && (
        <div className="text-center text-muted py-5">
          <i className="bi bi-person-x fs-1 d-block mb-2"></i>
          <p>No users found for "{searchQuery}"</p>
        </div>
      )}

      {users.map((user) => (
        <Card key={user.id} className="mb-2 border-0 shadow-sm">
          <Card.Body className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
              <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10" style={{ width: 40, height: 40, flexShrink: 0 }}>
                <i className="bi bi-person-fill text-primary"></i>
              </div>
              <div className="min-w-0">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <strong className="text-truncate">{user.username}</strong>
                  {user.blocked && <Badge bg="danger">Blocked</Badge>}
                  {user.roles?.map((r, i) => (
                    <Badge key={i} bg={r === "ADMIN" ? "danger" : "primary"} className="opacity-75" style={{ fontSize: "0.7em" }}>{r}</Badge>
                  ))}
                </div>
                <small className="text-muted text-truncate d-block">{user.email}</small>
                <small className="text-muted">
                  {user.taskCount} tasks · {user.listCount} lists · {user.teamCount} teams
                </small>
              </div>
            </div>
            <div className="d-flex gap-1">
              <Button variant="outline-primary" size="sm" onClick={() => handleViewUser(user)} title="View details">
                <i className="bi bi-eye"></i>
              </Button>
              <Button
                variant={user.blocked ? "outline-success" : "outline-danger"}
                size="sm"
                onClick={() => handleToggleBlock(user)}
                title={user.blocked ? "Unblock" : "Block"}
              >
                <i className={`bi ${user.blocked ? "bi-unlock" : "bi-lock"}`}></i>
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}

      {/* User Detail Modal */}
      <UserDetailModal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        user={selectedUser}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        show={confirmConfig.show}
        onHide={() => setConfirmConfig({ show: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        confirmVariant={confirmConfig.confirmVariant}
      />
    </>
  );
};

export default UserManagementTab;
