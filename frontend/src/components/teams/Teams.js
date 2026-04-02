import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import teamService from "../../services/teamService";
import { successToast, errorToast } from "../common/Noty";

const Teams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState([]);

  useEffect(() => {
    loadTeams();
    loadPendingInvitations();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await teamService.getMyTeams();
      setTeams(data);
    } catch (err) {
      errorToast("Error loading teams");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingInvitations = async () => {
    try {
      const data = await teamService.getMyPendingInvitations();
      setPendingInvitations(data);
    } catch (err) {
      // Silently fail
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await teamService.createTeam(newTeam);
      successToast("Team created successfully");
      setShowCreateModal(false);
      setNewTeam({ name: "", description: "" });
      loadTeams();
    } catch (err) {
      errorToast("Error creating team");
    } finally {
      setCreating(false);
    }
  };

  const handleRespondInvitation = async (token, accept) => {
    try {
      await teamService.respondToInvitation(token, accept);
      successToast(accept ? "Invitation accepted" : "Invitation rejected");
      loadPendingInvitations();
      if (accept) loadTeams();
    } catch (err) {
      errorToast("Error responding to invitation");
    }
  };

  return (
    <Container fluid className="py-4 px-4 mt-2 mt-md-0">
      {/* Header */}
      <div className="tittle-tab-container mb-3">
        <h2 className="fw-bold mb-2 flex-grow-1">
          <i className="bi bi-people me-2"></i>Teams
        </h2>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            className="rounded-3"
            onClick={() => {
              setLoading(true);
              loadTeams();
              loadPendingInvitations();
            }}
            title="Refresh"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button
            variant="primary"
            className="rounded-3"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-lg me-1"></i> New Team
          </Button>
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Alert variant="info" className="mb-3">
          <Alert.Heading className="fs-6">
            <i className="bi bi-envelope me-2"></i>Pending Invitations
          </Alert.Heading>
          {pendingInvitations.map((inv) => (
            <div
              key={inv.id}
              className="d-flex align-items-center justify-content-between py-2 border-bottom"
            >
              <div>
                <strong>{inv.teamName}</strong>
                <small className="text-muted ms-2">
                  invited by {inv.invitedByUsername}
                </small>
              </div>
              <div>
                <Button
                  size="sm"
                  variant="success"
                  className="me-2"
                  onClick={() => handleRespondInvitation(inv.token, true)}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => handleRespondInvitation(inv.token, false)}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </Alert>
      )}

      {/* Teams List */}
      <div>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i
              className="bi bi-people"
              style={{ fontSize: "3rem", opacity: 0.3 }}
            ></i>
            <p className="mt-3">
              You don't belong to any teams yet. Create one to get started!
            </p>
          </div>
        ) : (
          <Row className="g-3">
            {teams.map((team) => (
              <Col key={team.id} xs={12} sm={6} lg={4}>
                <Card
                  className="h-100 border rounded-3 task-card"
                  role="button"
                  onClick={() => navigate(`/home/teams/${team.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-people-fill text-primary me-2 fs-4"></i>
                      <h5 className="mb-0 fw-semibold text-truncate">
                        {team.name}
                      </h5>
                    </div>
                    {team.description && (
                      <p
                        className="text-muted small mb-2 text-truncate"
                        style={{ maxHeight: "3em" }}
                      >
                        {team.description}
                      </p>
                    )}
                    <div className="mt-auto d-flex align-items-center gap-2">
                      <Badge bg="secondary" pill>
                        <i className="bi bi-person me-1"></i>
                        {team.memberCount} members
                      </Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Create Team Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Team</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateTeam}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Team Name</Form.Label>
              <Form.Control
                type="text"
                value={newTeam.name}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, name: e.target.value })
                }
                placeholder="Enter team name"
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTeam.description}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, description: e.target.value })
                }
                placeholder="Describe the team's purpose"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? (
                <Spinner size="sm" animation="border" />
              ) : (
                "Create Team"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Teams;
