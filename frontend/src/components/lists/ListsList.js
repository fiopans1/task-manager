import { useCallback, useState } from "react";
import { Badge, Button, Card, Col, Modal, Row } from "react-bootstrap";
import { useServerInfiniteScroll } from "../../hooks/useInfiniteScroll";
import listService from "../../services/listService";
import { errorToast, successToast } from "../common/Noty";

const ListsList = ({
  listsResource,
  handleOpenList,
  handleEditList,
  refreshLists,
  searchTerm,
}) => {
  const [showDelete, setShowDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const fetchPage = useCallback(
    async (page, size) => listService.fetchListsPage(page, size, searchTerm),
    [searchTerm]
  );

  const { items: data, LoadMoreSpinner } = useServerInfiniteScroll(fetchPage, 50, [
    listsResource,
    searchTerm,
  ]);

  const deleteList = async () => {
    try {
      if (!idToDelete) {
        errorToast("Error: No lists selected");
        return;
      }

      await listService.deleteList(idToDelete);
      listService.invalidateListsCache();
      setIdToDelete(null);
      refreshLists();
      successToast("List deleted successfully");
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-sm rounded-4 text-center py-5">
        <Card.Body>
          <div className="mb-3 text-body-secondary">
            <i className="bi bi-card-checklist fs-1"></i>
          </div>
          <Card.Title>No lists available</Card.Title>
          <Card.Text className="text-body-secondary">Create a new list to organize your tasks.</Card.Text>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="d-grid gap-3">
      {data.map((card) => (
        <Card key={card.id} className="item-card border-0 shadow-sm rounded-4 overflow-hidden">
          <div style={{ height: 6, backgroundColor: card.color }}></div>
          <Card.Body className="p-3 p-lg-4">
            <Row className="g-3 align-items-start">
              <Col lg={8}>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                  <h5 className="mb-0 fw-semibold text-break">{card.nameOfList}</h5>
                  <Badge bg="light" text="dark" pill className="border">
                    {card.completedElements} / {card.totalElements} done
                  </Badge>
                </div>
                <p className="text-body-secondary mb-0">
                  {card.descriptionOfList || <span className="fst-italic">No description</span>}
                </p>
              </Col>
              <Col lg={4}>
                <div className="d-flex flex-wrap justify-content-lg-end gap-2">
                  <Button variant="light" className="rounded-pill px-3 border" onClick={() => handleOpenList(card.id)}>
                    <i className="bi bi-card-checklist me-2"></i>
                    Open
                  </Button>
                  <Button variant="outline-primary" className="rounded-pill px-3" onClick={() => handleEditList(card)}>
                    <i className="bi bi-pencil me-2"></i>
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    className="rounded-pill px-3"
                    onClick={() => {
                      setIdToDelete(card.id);
                      setShowDelete(true);
                    }}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Delete
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}

      <LoadMoreSpinner />

      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered backdrop="static" contentClassName="border-0 shadow-sm rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>Confirm deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2 text-body-secondary">
          Are you sure you want to delete this list? This action cannot be undone.
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
              deleteList();
            }}
          >
            Delete List
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListsList;
