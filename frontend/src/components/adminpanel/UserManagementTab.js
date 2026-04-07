import React, { useState } from "react";
import {
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import adminService from "../../services/adminService";
import { successToast, errorToast } from "../common/Noty";
import UserDetailModal from "./UserDetailModal";
import ConfirmModal from "./ConfirmModal";
import UserSearchResults from "./UserSearchResults";
import { useTranslation } from 'react-i18next';

const UserManagementTab = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ show: false });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearched(true);
    setActiveQuery(searchQuery);
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

  return (
    <>
      {/* Search */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder={t('admin.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="primary" type="submit">
                <i className="bi bi-search"></i>
                <span className="d-none d-sm-inline ms-2">{t('admin.search')}</span>
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* Results */}
      {!searched && (
        <div className="text-center text-muted py-5">
          <i className="bi bi-search fs-1 d-block mb-2"></i>
          <p>{t('admin.searchHint')}</p>
        </div>
      )}

      {searched && activeQuery && (
        <UserSearchResults
          query={activeQuery}
          refreshKey={refreshKey}
          onViewUser={handleViewUser}
          onToggleBlock={handleToggleBlock}
        />
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
