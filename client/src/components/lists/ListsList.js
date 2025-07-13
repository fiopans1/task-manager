import { useState, useEffect } from "react";
import { Row, Card, Button, Modal } from "react-bootstrap";
import { successToast, errorToast } from "../common/Noty";
import listService from "../../services/listService";
const ListsList = ({
  listsResource,
  handleOpenList,
  handleEditList,
  refreshLists,
}) => {
  const [data, setData] = useState(listsResource.read());
  const [showDelete, setShowDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const EmptyState = () => (
    <Card className="text-center shadow-sm py-5">
      <Card.Body>
        <div className="mb-4">
          <i
            className="bi bi-clipboard text-muted"
            style={{ fontSize: "2.5rem" }}
          ></i>
        </div>
        <Card.Title>No lists available</Card.Title>
        <Card.Text className="text-muted">Please create a new list</Card.Text>
      </Card.Body>
    </Card>
  );

  const deleteList = async () => {
    try {
      if (idToDelete) {
        await listService.deleteList(idToDelete);
        listService.invalidateListsCache();
        setIdToDelete(null);
        refreshLists();
        successToast("List deleted successfully");
      } else {
        errorToast("Error: No lists selected");
      }
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  const confirmDeleteList = (id) => {
    setIdToDelete(id);
    setShowDelete(true);
  };

  useEffect(() => {
    setData(listsResource.read());
  }, [listsResource]);

  return !data || data.length === 0 ? (
    <EmptyState />
  ) : (
    <div className="list-list">
      {data?.map((card) => (
        <Row key={card.id} className="m-1">
          <Card
            style={{ borderTop: `6px solid ${card.color}` }}
            className="w-100 mb-2 hover-shadow"
          >
            <Card.Body>
              <div className="d-flex">
                <div className="flex-grow-1">
                  <Card.Subtitle className="mt-0 mb-0 fw-bold">
                    {card.nameOfList}
                  </Card.Subtitle>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditList(card);
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteList(card.id);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
              <Row>
                <Card.Text className="mt-2 mb-0" style={{ fontSize: "13px" }}>
                  {card.descriptionOfList}
                </Card.Text>
                {/* <Card.Text
                  className="mb-1"
                  style={{ fontSize: "0.7rem", color: "#6b7280" }}
                >
                  {card.tasksCompleted} de {card.totalTasks} tareas completadas
                </Card.Text> */}
                <Button
                  variant="success"
                  className="m-2"
                  onClick={() => handleOpenList(card.id)}
                >
                  <i className="bi bi-card-checklist me-1"></i>
                  See List
                </Button>
              </Row>
            </Card.Body>
          </Card>
        </Row>
      ))}

      {/* Modal de confirmación para eliminar */}
      <Modal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this list? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowDelete(false);
              setIdToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
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
