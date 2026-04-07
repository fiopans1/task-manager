import { Form, Modal, Button, Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import teamService from "../../services/teamService";
import { successToast, errorToast } from "../common/Noty";

const NewEditTeam = ({
  show,
  handleClose,
  refreshTeams,
  editOrNew,
  initialData,
  onSave,
}) => {
  const { t } = useTranslation();
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

  const validateForm = () => {
    if (!formData.name || formData.name.trim() === "") {
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setValidated(true);

    if (!validateForm()) {
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
    <Modal show={show} onHide={handleModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {editOrNew ? (
            <><i className="bi bi-pencil me-2"></i>{t('newEditTeam.editTeam')}</>
          ) : (
            t('newEditTeam.createNewTeam')
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{t('newEditTeam.teamName')}</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('newEditTeam.teamNamePlaceholder')}
              required
              autoFocus
              isInvalid={validated && (!formData.name || formData.name.trim() === "")}
            />
            <Form.Control.Feedback type="invalid">
              {t('newEditTeam.teamNameRequired')}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>{t('newEditTeam.description')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('newEditTeam.descriptionPlaceholder')}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>
          {t('newEditTeam.cancel')}
        </Button>
        <Button
          variant="primary"
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
            <><i className="bi bi-check-lg me-1"></i>{t('newEditTeam.saveChanges')}</>
          ) : (
            t('newEditTeam.createTeam')
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewEditTeam;
