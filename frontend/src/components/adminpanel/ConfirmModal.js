import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from 'react-i18next';

const ConfirmModal = ({ show, onHide, onConfirm, title, message, confirmText = "Confirm", confirmVariant = "danger" }) => {
  const { t } = useTranslation();
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" onClick={onHide} className="rounded-3 px-4 fw-medium">
          {t('confirm.cancel')}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} className="rounded-3 px-4 fw-medium">
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
