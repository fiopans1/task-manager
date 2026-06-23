import { useCallback, useState } from "react";
import { Badge, Button, Card, Col, Modal, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useServerInfiniteScroll } from "../../hooks/useInfiniteScroll";
import teamService from "../../services/teamService";
import { errorToast, promiseToast } from "../common/Noty";
import NewEditTeam from "./NewEditTeam";

const TeamsList = ({ refreshKey, searchTerm, refreshTeams }) => {
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    const [showDelete, setShowDelete] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);
    const [editingTeam, setEditingTeam] = useState(null);

    const fetchPage = useCallback(
        async (page, size) => teamService.fetchTeamsPage(page, size, searchTerm),
        [searchTerm]
    );

    const { items: data, initialLoading, LoadMoreSpinner } = useServerInfiniteScroll(fetchPage, 50, [searchTerm, refreshKey]);

    const deleteTeam = async () => {
        if (!idToDelete) {
            errorToast("Error: No team selected");
            return;
        }
        try {
            await promiseToast(teamService.deleteTeam(idToDelete), {
                loading: "Deleting team...",
                success: "Team deleted successfully",
                error: (e) => "Error: " + (e?.message || e),
            });
            teamService.invalidateTeamsCache();
            setIdToDelete(null);
            if (refreshTeams) refreshTeams();
        } catch (error) {
            // toast already shown by promiseToast
        }
    };

    if (initialLoading) {
        return (
            <Card className="border-0 shadow-sm rounded-4 text-center py-5">
                <Card.Body>
                    <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
                    <p className="text-body-secondary mt-3 mb-0">Loading teams...</p>
                </Card.Body>
            </Card>
        );
    }

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
                                <div className="mt-auto d-flex flex-wrap gap-2">
                                    <Button
                                        variant={darkMode ? "light" : "dark"}
                                        className="rounded-pill px-3"
                                        onClick={() => navigate(`/home/teams/${team.id}`)}
                                    >
                                        Open team
                                    </Button>
                                    <Button
                                        variant="outline-primary"
                                        className="rounded-pill px-3"
                                        onClick={() => setEditingTeam(team)}
                                    >
                                        <i className="bi bi-pencil me-2"></i>
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        className="rounded-pill px-3"
                                        onClick={() => {
                                            setIdToDelete(team.id);
                                            setShowDelete(true);
                                        }}
                                    >
                                        <i className="bi bi-trash me-2"></i>
                                        Delete
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <LoadMoreSpinner />

            <Modal
                show={showDelete}
                onHide={() => {
                    setShowDelete(false);
                    setIdToDelete(null);
                }}
                centered
                backdrop="static"
                contentClassName="border-0 shadow-sm rounded-4"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title>Confirm deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2 text-body-secondary">
                    Are you sure you want to delete this team? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button
                        variant="outline-secondary"
                        className="rounded-pill px-4"
                        onClick={() => {
                            setShowDelete(false);
                            setIdToDelete(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        className="rounded-pill px-4"
                        onClick={() => {
                            setShowDelete(false);
                            deleteTeam();
                        }}
                    >
                        Delete Team
                    </Button>
                </Modal.Footer>
            </Modal>

            <NewEditTeam
                show={editingTeam !== null}
                handleClose={() => setEditingTeam(null)}
                refreshTeams={refreshTeams}
                editOrNew={editingTeam !== null}
                initialData={editingTeam || {}}
            />
        </>
    );
};

export default TeamsList;
