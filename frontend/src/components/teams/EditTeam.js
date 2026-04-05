import { Form, Modal, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { successToast, errorToast } from "../common/Noty";

const EditTeam = ({
  show,
  handleClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.name || formData.name.trim() === "") {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    if (!validateForm()) {
      return;
    }
    try {
      await onSave(formData);
      successToast("Team updated successfully");
      setValidated(false);
      handleClose();
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  return (
    <Modal show={show} onHide={() => { setValidated(false); handleClose(); }} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-pencil me-2"></i>Edit Team
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Team Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Team name"
              required
              autoFocus
              isInvalid={validated && (!formData.name || formData.name.trim() === "")}
            />
            <Form.Control.Feedback type="invalid">
              Team name is required
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Team description (optional)"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setValidated(false); handleClose(); }}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            <i className="bi bi-check-lg me-1"></i>Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditTeam;
