import { Container, Form, Modal, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import listService from "../../services/listService";
import { successToast, errorToast } from "../common/Noty";

const NewEditLists = ({
  show,
  handleClose,
  refreshLists,
  editOrNew,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    id: null,
    nameOfList: "",
    descriptionOfList: "",
    color: "#0d6efd",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    if (editOrNew && initialData && Object.keys(initialData).length > 0) {
      setFormData({
        id: initialData.id || null,
        nameOfList: initialData.nameOfList || "",
        descriptionOfList: initialData.descriptionOfList || "",
        color: initialData.color || "#0d6efd",
      });
    }
  }, [initialData, editOrNew]);

  const handleSubmit = async (e) => {
    //TO-DO: Necesitamos comprobar las fechas son correctas, es decir que la fecha de inicio sea menor que la de fin
    //e.preventDefault();
    try {
      if (editOrNew && formData.id) {
        await listService.updateList(formData);
        successToast("List updated successfully");
      } else {
        await listService.createList(formData);
        successToast("List created successfully");
      }
      refreshLists();
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  return (
    <Container>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editOrNew ? "Edit List" : "New List"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="nameOfList"
                value={formData.nameOfList}
                onChange={handleChange}
                placeholder="Name of the list"
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="descriptionOfList"
                value={formData.descriptionOfList}
                onChange={handleChange}
                placeholder="Description of the list"
                rows={3}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  title="Choose a color for the list"
                  className="me-2"
                />
                <div
                  className="flex-grow-1 rounded"
                  style={{ backgroundColor: formData.color, height: "38px" }}
                ></div>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleClose();
              handleSubmit();
            }}
          >
            {editOrNew ? "Update" : "Create List"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NewEditLists;
