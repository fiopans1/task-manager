import { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import teamService from "../../services/teamService";
import { errorToast, successToast } from "../common/Noty";

const NewEditTeam = ({
  show,
  handleClose,
  refreshTeams,
  editOrNew,
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editOrNew && initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
      });
    }
  }, [initialData, editOrNew]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setValidated(true);

    if (!formData.name.trim()) {
      return false;
    }

    setSubmitting(true);
    try {
      if (onSave) {
        await onSave(formData);
        successToast(editOrNew ? "Team updated successfully" : "Team created successfully");
      } else if (editOrNew) {
        errorToast("Error: onSave handler is required for edit mode");
        return false;
      } else {
        await teamService.createTeam(formData);
        successToast("Team created successfully");
      }

      if (refreshTeams) refreshTeams();
      return true;
    } catch (error) {
      errorToast("Error: " + (error?.response?.data?.message || error.message));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setValidated(false);
    if (!editOrNew) {
      setFormData({ name: "", description: "" });
    }
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered contentClassName="border-0 shadow-sm rounded-4">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-semibold">{editOrNew ? "Edit Team" : "Create Team"}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="text-body-secondary small text-uppercase">Team Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter team name"
              required
              autoFocus
              isInvalid={validated && !formData.name.trim()}
            />
            <Form.Control.Feedback type="invalid">Team name is required</Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label className="text-body-secondary small text-uppercase">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Team description (optional)"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleModalClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          className="rounded-pill px-4"
          disabled={submitting}
          onClick={async () => {
            const success = await handleSubmit();
            if (success) {
              handleModalClose();
            }
          }}
        >
          {submitting ? (
            <Spinner size="sm" animation="border" />
          ) : editOrNew ? (
            "Save Changes"
          ) : (
            "Create Team"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewEditTeam;
