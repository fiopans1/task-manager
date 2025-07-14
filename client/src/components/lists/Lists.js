import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import listService from "../../services/listService";
import { errorToast } from "../common/Noty";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import {
  Container,
  Col,
  Row,
  Card,
  InputGroup,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";
import ListsList from "./ListsList";
import NewEditLists from "./NewEditLists";

const List = () => {
  const [showNewList, setshowNewList] = useState(false);
  const [showEditList, setshowEditList] = useState(false);
  const [formEditData, setFormEditData] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const navigateTo = useNavigate();
  const location = useLocation();
  const handleOpenList = (id) => {
    navigateTo(`${location.pathname}/${id}`);
  };

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleClose = () => setshowNewList(false);
  const handleshowNewList = () => setshowNewList(true);
  const handleCloseEdit = () => setshowEditList(false);
  const handleshowEditList = (list) => {
    setFormEditData(list);
    setshowEditList(true);
  };

  const [listsResource, setListsResource] = useState(listService.getLists());

  const refreshLists = () => {
    listService.invalidateListsCache();
    setListsResource(listService.getLists());
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implementar la búsqueda si el servicio lo soporta
    // Por ahora, simplemente actualiza las tareas
    refreshLists();
  };

  const handleErrors = (error, info) => {
    errorToast("Error: " + error.message);
  };

  return (
    <Container fluid className="px-3">
      <div className="tittle-tab-container">
        <h2>My Lists</h2>
      </div>
      {/* Primera fila con controles */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className={isMobile ? "gy-2" : "align-items-center"}>
              <Col md={8}>
                <InputGroup>
                  <Form.Control
                    className="border-end-0"
                    placeholder="Search lists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-primary" type="submit">
                    Search
                  </Button>
                </InputGroup>
              </Col>
              <Col
                md={4}
                className={`d-flex ${
                  isMobile ? "mt-2" : "justify-content-end"
                }`}
              >
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    refreshLists();
                  }}
                  className="me-2"
                  size={isMobile ? "sm" : ""}
                >
                  Clear
                </Button>
                <Button
                  variant="outline-info"
                  className="me-2"
                  onClick={refreshLists}
                  size={isMobile ? "sm" : ""}
                >
                  Refresh
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={handleshowNewList}
                  className="me-2"
                  size={isMobile ? "sm" : ""}
                >
                  <span className="me-1">+</span> New List
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Segunda fila con la lista de tareas */}
      <Row>
        <Col>
          <Container
            fluid
            className="overflow-auto tasks-container"
            style={{
              height: isMobile ? "calc(100vh - 230px)" : "80vh",
              width: "100%",
              paddingBottom: isMobile ? "80px" : "20px",
            }}
          >
            <ErrorBoundary
              resetKeys={[refreshKey]}
              onError={handleErrors}
              fallback={
                <Container className="text-center mt-5">
                  <h2 style={{ color: "red" }}>Something went wrong</h2>
                  <p>There was an error loading your lists.</p>
                  <Button variant="primary" onClick={refreshLists}>
                    Try Again
                  </Button>
                </Container>
              }
            >
              <Suspense
                fallback={
                  <Container className="text-center mt-5">
                    <Spinner animation="border" />
                    <p className="mt-2">Loading lists...</p>
                  </Container>
                }
              >
                <ListsList
                  key={`lists-list-${refreshKey}`}
                  listsResource={listsResource}
                  handleOpenList={handleOpenList}
                  handleEditList={handleshowEditList}
                  refreshLists={refreshLists}
                />
              </Suspense>
            </ErrorBoundary>
          </Container>
        </Col>
      </Row>
      {/* Modales */}
      <NewEditLists
        show={showNewList}
        handleClose={handleClose}
        refreshLists={refreshLists}
        editOrNew={false}
        initialData={{}}
      />
      <NewEditLists
        show={showEditList}
        handleClose={handleCloseEdit}
        refreshLists={refreshLists}
        editOrNew={true}
        initialData={formEditData}
      />
    </Container>
  );
};

export default List;
