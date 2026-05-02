import React, { Suspense, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { ErrorBoundary } from "react-error-boundary";
import { useLocation } from "react-router-dom";
import teamService from "../../services/teamService";
import { errorToast, successToast } from "../common/Noty";
import NewEditTeam from "./NewEditTeam";
import TeamsList from "./TeamsList";

const Teams = () => {
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [teamsResource, setTeamsResource] = useState(() => teamService.getTeams());

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
    } catch {
      setPendingInvitations([]);
    }
  };

  const handleRespondInvitation = async (token, accept) => {
    try {
      await teamService.respondToInvitation(token, accept);
      successToast(accept ? "Invitation accepted" : "Invitation rejected");
      loadPendingInvitations();
      if (accept) refreshTeams();
    } catch {
      errorToast("Error responding to invitation");
    }
  };

  const handleErrors = (error) => {
    errorToast("Error: " + error.message);
  };

  return (
    <Container fluid className="px-3 px-lg-4 py-4 pb-5">
      <Row className="align-items-center g-3 mb-4">
        <Col>
          <h2 className="fw-semibold mb-1">Teams</h2>
          <p className="text-body-secondary mb-0">Collaborate in a more focused layout without losing any team workflows.</p>
        </Col>
        <Col xs={12} md="auto">
          <Button variant="primary" className="rounded-pill px-4" onClick={() => setShowCreateModal(true)}>
            <i className="bi bi-plus-lg me-2"></i>
            New Team
          </Button>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3 p-lg-4">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              setActiveSearchTerm(searchTerm.trim());
              teamService.invalidateTeamsCache();
              setTeamsResource(teamService.getTeams());
              setRefreshKey((prevKey) => prevKey + 1);
            }}
          >
            <Row className="g-3 align-items-center">
              <Col lg={7}>
                <InputGroup>
                  <InputGroup.Text className="bg-body border-end-0 rounded-start-pill">
                    <i className="bi bi-search text-body-secondary"></i>
                  </InputGroup.Text>
                  <Form.Control
                    className="border-start-0 rounded-end-pill"
                    placeholder="Search teams"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col lg={5}>
                <div className="d-flex flex-wrap justify-content-lg-end gap-2">
                  <Button type="submit" variant="dark" className="rounded-pill px-4">
                    Search
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="rounded-pill px-4"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveSearchTerm("");
                      refreshTeams();
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline-primary"
                    className="rounded-pill px-4"
                    onClick={() => {
                      refreshTeams();
                      loadPendingInvitations();
                    }}
                  >
                    Refresh
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {pendingInvitations.length > 0 && (
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body className="p-3 p-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Badge bg="info" pill>
                {pendingInvitations.length}
              </Badge>
              <h3 className="h6 mb-0">Pending invitations</h3>
            </div>
            <div className="d-grid gap-3">
              {pendingInvitations.map((inv) => (
                <div key={inv.id} className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border rounded-4 p-3 bg-body-tertiary">
                  <div>
                    <div className="fw-semibold">{inv.teamName}</div>
                    <div className="text-body-secondary small">Invited by {inv.invitedByUsername}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="success" className="rounded-pill px-3" onClick={() => handleRespondInvitation(inv.token, true)}>
                      Accept
                    </Button>
                    <Button size="sm" variant="outline-danger" className="rounded-pill px-3" onClick={() => handleRespondInvitation(inv.token, false)}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      <ErrorBoundary
        resetKeys={[refreshKey]}
        onError={handleErrors}
        fallback={
          <Card className="border-0 shadow-sm rounded-4 text-center py-5">
            <Card.Body>
              <h3 className="h5 text-danger mb-2">Something went wrong</h3>
              <p className="text-body-secondary mb-4">There was an error loading your teams.</p>
              <Button variant="primary" className="rounded-pill px-4" onClick={refreshTeams}>
                Try Again
              </Button>
            </Card.Body>
          </Card>
        }
      >
        <Suspense
          fallback={
            <Card className="border-0 shadow-sm rounded-4 text-center py-5">
              <Card.Body>
                <Spinner animation="border" />
                <p className="text-body-secondary mt-3 mb-0">Loading teams...</p>
              </Card.Body>
            </Card>
          }
        >
          <TeamsList
            key={`teams-list-${refreshKey}`}
            teamsResource={teamsResource}
            searchTerm={activeSearchTerm}
          />
        </Suspense>
      </ErrorBoundary>

      <NewEditTeam
        show={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        refreshTeams={refreshTeams}
        editOrNew={false}
        initialData={{}}
      />
    </Container>
  );
};

export default Teams;
