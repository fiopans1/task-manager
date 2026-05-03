import { Suspense, useEffect, useState } from "react";
import {
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
import { useLocation, useNavigate } from "react-router-dom";
import listService from "../../services/listService";
import { errorToast } from "../common/Noty";
import ListsList from "./ListsList";
import NewEditLists from "./NewEditLists";

const List = () => {
  const [showNewList, setshowNewList] = useState(false);
  const [showEditList, setshowEditList] = useState(false);
  const [formEditData, setFormEditData] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const navigateTo = useNavigate();
  const location = useLocation();
  const [listsResource, setListsResource] = useState(() => listService.getLists());

  useEffect(() => {
    setListsResource(listService.getLists());
    setRefreshKey((prevKey) => prevKey + 1);
  }, [location.key]);

  const refreshLists = () => {
    listService.invalidateListsCache();
    setListsResource(listService.getLists());
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearchTerm(searchTerm.trim());
    listService.invalidateListsCache();
    setListsResource(listService.getLists());
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleErrors = (error) => {
    errorToast("Error: " + error.message);
  };

  return (
    <Container fluid className="px-3 px-lg-4 py-4 pb-5">
      <Row className="align-items-center g-3 mb-4">
        <Col>
          <h2 className="fw-semibold mb-1">My Lists</h2>
          <p className="text-body-secondary mb-0">Keep your projects grouped in a clearer, more focused workspace.</p>
        </Col>
        <Col xs={12} md="auto">
          <Button variant="primary" className="rounded-pill px-4" onClick={() => setshowNewList(true)}>
            <i className="bi bi-plus-lg me-2"></i>
            New List
          </Button>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3 p-lg-4">
          <Form onSubmit={handleSearch}>
            <Row className="g-3 align-items-center">
              <Col lg={7}>
                <InputGroup>
                  <InputGroup.Text className="bg-body border-end-0 rounded-start-pill">
                    <i className="bi bi-search text-body-secondary"></i>
                  </InputGroup.Text>
                  <Form.Control
                    className="border-start-0 rounded-end-pill"
                    placeholder="Search lists"
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
                      refreshLists();
                    }}
                  >
                    Clear
                  </Button>
                  <Button variant="outline-primary" className="rounded-pill px-4" onClick={refreshLists}>
                    Refresh
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <ErrorBoundary
        resetKeys={[refreshKey]}
        onError={handleErrors}
        fallback={
          <Card className="border-0 shadow-sm rounded-4 text-center py-5">
            <Card.Body>
              <h3 className="h5 text-danger mb-2">Something went wrong</h3>
              <p className="text-body-secondary mb-4">There was an error loading your lists.</p>
              <Button variant="primary" className="rounded-pill px-4" onClick={refreshLists}>
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
                <p className="text-body-secondary mt-3 mb-0">Loading lists...</p>
              </Card.Body>
            </Card>
          }
        >
          <ListsList
            key={`lists-list-${refreshKey}`}
            listsResource={listsResource}
            handleOpenList={(id) => navigateTo(`${location.pathname}/${id}`)}
            handleEditList={(list) => {
              setFormEditData(list);
              setshowEditList(true);
            }}
            refreshLists={refreshLists}
            searchTerm={activeSearchTerm}
          />
        </Suspense>
      </ErrorBoundary>

      <NewEditLists
        show={showNewList}
        handleClose={() => setshowNewList(false)}
        refreshLists={refreshLists}
        editOrNew={false}
        initialData={{}}
      />
      <NewEditLists
        show={showEditList}
        handleClose={() => setshowEditList(false)}
        refreshLists={refreshLists}
        editOrNew={true}
        initialData={formEditData}
      />
    </Container>
  );
};

export default List;
