import { useCallback } from "react";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useServerInfiniteScroll } from "../../hooks/useInfiniteScroll";
import teamService from "../../services/teamService";

const TeamsList = ({ teamsResource, searchTerm }) => {
  const navigate = useNavigate();

  const fetchPage = useCallback(
    async (page, size) => teamService.fetchTeamsPage(page, size, searchTerm),
    [searchTerm]
  );

  const { items: data, LoadMoreSpinner } = useServerInfiniteScroll(fetchPage, 50, [
    teamsResource,
    searchTerm,
  ]);

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-sm rounded-4 text-center py-5">
        <Card.Body>
          <div className="mb-3 text-body-secondary">
            <i className="bi bi-people fs-1"></i>
          </div>
          <Card.Title>{searchTerm ? "No teams found" : "No teams yet"}</Card.Title>
          <Card.Text className="text-body-secondary">
            {searchTerm
              ? "Try another search to find the team you need."
              : "Create a team to start collaborating with other users."}
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Row className="g-3">
        {data.map((team) => (
          <Col key={team.id} xs={12} md={6} xl={4}>
            <Card className="item-card border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4 d-flex flex-column gap-3">
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary mb-3" style={{ width: 44, height: 44 }}>
                      <i className="bi bi-people fs-5"></i>
                    </div>
                    <h5 className="fw-semibold mb-1 text-break">{team.name}</h5>
                    <p className="text-body-secondary mb-0">
                      {team.description || <span className="fst-italic">No description</span>}
                    </p>
                  </div>
                  <Badge bg="light" text="dark" pill className="border">
                    {team.memberCount} members
                  </Badge>
                </div>
                <div className="mt-auto">
                  <Button variant="dark" className="rounded-pill px-4" onClick={() => navigate(`/home/teams/${team.id}`)}>
                    Open team
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <LoadMoreSpinner />
    </>
  );
};

export default TeamsList;
