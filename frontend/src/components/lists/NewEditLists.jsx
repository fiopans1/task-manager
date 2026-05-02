import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import listService from "../../services/listService";
import { errorToast, successToast } from "../common/Noty";

const NewEditLists = ({
  show,
  handleClose,
  refreshLists,
  editOrNew,
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    id: null,
    nameOfList: "",
    descriptionOfList: "",
    color: "#0d6efd",
  });
  const [validated, setValidated] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () =>
    Boolean(formData.nameOfList?.trim()) && Boolean(formData.color);

  const handleSubmit = async () => {
    setValidated(true);

    if (!validateForm()) {
      return false;
    }

    try {
      if (onSave) {
        await onSave(formData);
        successToast("List updated successfully");
      } else if (editOrNew && formData.id) {
        await listService.updateList(formData);
        successToast("List updated successfully");
      } else {
        await listService.createList(formData);
        successToast("List created successfully");
      }
      refreshLists();
      return true;
    } catch (error) {
      errorToast("Error: " + error.message);
      return false;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered contentClassName="border-0 shadow-sm rounded-4">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-semibold">{editOrNew ? "Edit List" : "New List"}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="text-body-secondary small text-uppercase">Title</Form.Label>
            <Form.Control
              type="text"
              name="nameOfList"
              value={formData.nameOfList}
              onChange={handleChange}
              placeholder="Name of the list"
              autoFocus
              required
              isInvalid={validated && !formData.nameOfList.trim()}
            />
            <Form.Control.Feedback type="invalid">List name is required</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-body-secondary small text-uppercase">Description</Form.Label>
            <Form.Control
              as="textarea"
              name="descriptionOfList"
              value={formData.descriptionOfList}
              onChange={handleChange}
              placeholder="Description of the list"
              rows={3}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="text-body-secondary small text-uppercase">Color</Form.Label>
            <div className="d-flex align-items-center gap-3">
              <Form.Control
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                title="Choose a color for the list"
                style={{ width: 64 }}
              />
              <div className="flex-grow-1 rounded-4 border" style={{ backgroundColor: formData.color, height: 44 }}></div>
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          className="rounded-pill px-4"
          onClick={async () => {
            const success = await handleSubmit();
            if (success) {
              handleClose();
            }
          }}
        >
          {editOrNew ? "Update" : "Create List"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewEditLists;
