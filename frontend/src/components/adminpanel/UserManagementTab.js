import React, { useState, Suspense } from "react";
import {
  Card,
  Form,
  Button,
  InputGroup,
  Spinner,
  Container,
} from "react-bootstrap";
import adminService from "../../services/adminService";
import { successToast, errorToast } from "../common/Noty";
import UserDetailModal from "./UserDetailModal";
import ConfirmModal from "./ConfirmModal";
import UserSearchResults from "./UserSearchResults";
import { ErrorBoundary } from "react-error-boundary";

const UserManagementTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ show: false });
  const [usersResource, setUsersResource] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearched(true);
    adminService.invalidateUserSearchCache();
    setUsersResource(adminService.searchUsersSuspense(searchQuery));
    setRefreshKey((prevKey) => prevKey + 1);
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
          await adminService.toggleUserBlock(user.id);
          // Refresh the search results
          adminService.invalidateUserSearchCache();
          setUsersResource(adminService.searchUsersSuspense(searchQuery));
          setRefreshKey((prevKey) => prevKey + 1);
          successToast(user.blocked ? "User unblocked" : "User blocked");
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

  const handleErrors = (error, info) => {
    errorToast("Error: " + error.message);
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
              <Button variant="primary" type="submit">
                <i className="bi bi-search"></i>
                <span className="d-none d-sm-inline ms-2">Search</span>
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* Results */}
      {!searched && (
        <div className="text-center text-muted py-5">
          <i className="bi bi-search fs-1 d-block mb-2"></i>
          <p>Search for users by their username</p>
        </div>
      )}

      {searched && usersResource && (
        <ErrorBoundary
          resetKeys={[refreshKey]}
          onError={handleErrors}
          fallback={
            <Container className="text-center mt-5">
              <h2 style={{ color: "red" }}>Something went wrong</h2>
              <p>There was an error searching users.</p>
              <Button variant="primary" onClick={handleSearch}>
                Try Again
              </Button>
            </Container>
          }
        >
          <Suspense
            fallback={
              <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p className="mt-2">Searching users...</p>
              </Container>
            }
          >
            <UserSearchResults
              key={`user-search-${refreshKey}`}
              usersResource={usersResource}
              onViewUser={handleViewUser}
              onToggleBlock={handleToggleBlock}
            />
          </Suspense>
        </ErrorBoundary>
      )}

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
