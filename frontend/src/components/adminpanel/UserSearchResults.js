import React, { useCallback } from "react";
import { Card, Button, Badge, Spinner } from "react-bootstrap";
import { useServerInfiniteScroll } from "../../hooks/useInfiniteScroll";
import adminService from "../../services/adminService";

const UserSearchResults = ({ query, refreshKey, onViewUser, onToggleBlock }) => {
  const fetchPage = useCallback(async (page, size) => {
    return adminService.fetchUserSearchPage(query, page, size);
  }, [query]);

  const { items: users, initialLoading, LoadMoreSpinner } = useServerInfiniteScroll(
    fetchPage, 50, [query, refreshKey]
  );

  if (initialLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" className="me-2" />
        <span className="text-muted">Searching users...</span>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <i className="bi bi-person-x fs-1 d-block mb-2"></i>
        <p>No users found</p>
      </div>
    );
  }

  return (
    <>
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
              <Button variant="outline-primary" size="sm" onClick={() => onViewUser(user)} title="View details">
                <i className="bi bi-eye"></i>
              </Button>
              <Button
                variant={user.blocked ? "outline-success" : "outline-danger"}
                size="sm"
                onClick={() => onToggleBlock(user)}
                title={user.blocked ? "Unblock" : "Block"}
              >
                <i className={`bi ${user.blocked ? "bi-unlock" : "bi-lock"}`}></i>
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}
      <LoadMoreSpinner />
    </>
  );
};

export default UserSearchResults;
