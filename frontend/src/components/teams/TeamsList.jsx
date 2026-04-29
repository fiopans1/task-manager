import { useCallback } from "react";
import { Row, Col, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useServerInfiniteScroll } from "../../hooks/useInfiniteScroll";
import teamService from "../../services/teamService";

const TeamsList = ({ teamsResource, searchTerm }) => {
  const navigate = useNavigate();

  const fetchPage = useCallback(async (page, size) => {
    return teamService.fetchTeamsPage(page, size, searchTerm);
  }, [searchTerm]);

  const { items: data, LoadMoreSpinner } = useServerInfiniteScroll(fetchPage, 50, [teamsResource, searchTerm]);

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <i
          className="bi bi-people"
          style={{ fontSize: "3rem", opacity: 0.3 }}
        ></i>
        <p className="mt-3">
          {searchTerm
            ? "No teams found matching your search"
            : "You don't belong to any teams yet. Create one to get started!"}
        </p>
      </div>
    );
  }

  return (
    <>
      <Row className="g-3">
        {data.map((team) => (
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
      <LoadMoreSpinner />
    </>
  );
};

export default TeamsList;
