import React from "react";
import { Button, Badge, ListGroup } from "react-bootstrap";

const InvitationsTab = ({ invitations, onCancelInvitation }) => {
  if (invitations.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <p>No pending invitations</p>
      </div>
    );
  }

  return (
    <ListGroup variant="flush">
      {invitations.map((inv) => (
        <ListGroup.Item key={inv.id} className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center overflow-hidden" style={{ minWidth: 0 }}>
            <i className="bi bi-person-circle me-2 fs-5 text-muted flex-shrink-0"></i>
            <div className="text-truncate">
              <span className="fw-medium">{inv.invitedUsername}</span>
              <Badge bg="warning" className="ms-2" pill>Pending</Badge>
              <br />
              <small className="text-muted">
                Invited by {inv.invitedByUsername} — {new Date(inv.createdDate).toLocaleDateString()}
              </small>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => onCancelInvitation(inv.id)}
            title="Cancel invitation"
          >
            <i className="bi bi-x-lg me-1"></i>Cancel
          </Button>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default InvitationsTab;
