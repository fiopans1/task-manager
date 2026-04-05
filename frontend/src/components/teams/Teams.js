import React, { useState, useEffect, Suspense } from "react";
import {
  Container,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  InputGroup,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import { useLocation } from "react-router-dom";
import teamService from "../../services/teamService";
import { successToast, errorToast } from "../common/Noty";
import { ErrorBoundary } from "react-error-boundary";
import TeamsList from "./TeamsList";

const Teams = () => {
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [teamsResource, setTeamsResource] = useState(() => teamService.getTeams());

  // Reload data when navigating back to this page (cache was invalidated by sidebar)
  useEffect(() => {
    setTeamsResource(teamService.getTeams());
    setRefreshKey((prevKey) => prevKey + 1);
    loadPendingInvitations();
  }, [location.key]);

  const refreshTeams = () => {
    teamService.invalidateTeamsCache();
    setTeamsResource(teamService.getTeams());
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const loadPendingInvitations = async () => {
    try {
      const data = await teamService.getMyPendingInvitations();
      setPendingInvitations(data);
    } catch (err) {
      // Silently fail
    }
  };

  const validateForm = () => {
    if (!newTeam.name || newTeam.name.trim() === "") {
      return false;
    }
    return true;
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setValidated(true);
    if (!validateForm()) {
      return;
    }
    setCreating(true);
    try {
      await teamService.createTeam(newTeam);
      successToast("Team created successfully");
      setShowCreateModal(false);
      setNewTeam({ name: "", description: "" });
      setValidated(false);
      refreshTeams();
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
      if (accept) refreshTeams();
    } catch (err) {
      errorToast("Error responding to invitation");
    }
  };

  const handleErrors = (error, info) => {
    errorToast("Error: " + error.message);
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
              refreshTeams();
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

      {/* Search */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-2">
            <Col xs={12}>
              <InputGroup>
                <Form.Control
                  className="border-end-0"
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setSearchTerm("");
                  }}
                >
                  Clear
                </Button>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

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

      {/* Teams List with Suspense */}
      <ErrorBoundary
        resetKeys={[refreshKey]}
        onError={handleErrors}
        fallback={
          <Container className="text-center mt-5">
            <h2 style={{ color: "red" }}>Something went wrong</h2>
            <p>There was an error loading your teams.</p>
            <Button variant="primary" onClick={refreshTeams}>
              Try Again
            </Button>
          </Container>
        }
      >
        <Suspense
          fallback={
            <Container className="text-center mt-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading teams...</p>
            </Container>
          }
        >
          <TeamsList
            key={`teams-list-${refreshKey}`}
            teamsResource={teamsResource}
            searchTerm={searchTerm}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Create Team Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false);
          setValidated(false);
        }}
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
                isInvalid={validated && (!newTeam.name || newTeam.name.trim() === "")}
              />
              <Form.Control.Feedback type="invalid">
                Team name is required
              </Form.Control.Feedback>
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
              onClick={() => {
                setShowCreateModal(false);
                setValidated(false);
              }}
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
