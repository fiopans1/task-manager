import { Container, Form, Modal, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import listService from "../../services/listService";
import { successToast, errorToast } from "../common/Noty";

const NewEditLists = ({
  show,
  handleClose,
  refreshLists,
  editOrNew,
  initialData,
  onSave,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    id: null,
    nameOfList: "",
    descriptionOfList: "",
    color: "#0d6efd",
  });
  const [validated, setValidated] = useState(false);

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

  const validateForm = () => {
    if (!formData.nameOfList || formData.nameOfList.trim() === "") {
      return false;
    }
    if (!formData.color || formData.color.trim() === "") {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
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
    <Container>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editOrNew ? t('newEditList.editList') : t('newEditList.newList')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('newEditList.title')}</Form.Label>
              <Form.Control
                type="text"
                name="nameOfList"
                value={formData.nameOfList}
                onChange={handleChange}
                placeholder={t('newEditList.titlePlaceholder')}
                autoFocus
                required
                isInvalid={validated && (!formData.nameOfList || formData.nameOfList.trim() === "")}
              />
              <Form.Control.Feedback type="invalid">
                {t('newEditList.titleRequired')}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('newEditList.description')}</Form.Label>
              <Form.Control
                as="textarea"
                name="descriptionOfList"
                value={formData.descriptionOfList}
                onChange={handleChange}
                placeholder={t('newEditList.descriptionPlaceholder')}
                rows={3}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('newEditList.color')}</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  title={t('newEditList.colorTooltip')}
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
            {t('newEditList.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              const success = await handleSubmit();
              if (success) {
                handleClose();
              }
            }}
          >
            {editOrNew ? t('newEditList.update') : t('newEditList.createList')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NewEditLists;
