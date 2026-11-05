import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import profileService from "../../services/profileService";
import { errorToast, successToast } from "../common/Noty";

const EMPTY_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ChangePasswordModal = ({ show, onHide }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      setForm(EMPTY_FORM);
      setSubmitting(false);
    }
  }, [show]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      errorToast("Passwords do not match");
      return;
    }

    if (form.newPassword === form.currentPassword) {
      errorToast("New password must be different from the current password");
      return;
    }

    setSubmitting(true);
    try {
      await profileService.changePassword(form.currentPassword, form.newPassword);
      successToast("Password changed. Please sign in again.");
      authService.clearLocalSession();
      onHide();
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Could not change password";
      errorToast(message);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={submitting ? () => {} : onHide}
      centered
      backdrop="static"
      keyboard={!submitting}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!submitting}>
          <Modal.Title>
            <i className="bi bi-key me-2"></i>
            Change password
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" data-testid="change-password-warning">
            <div className="d-flex gap-2 align-items-start">
              <i className="bi bi-exclamation-triangle-fill mt-1"></i>
              <span>
                Changing your password will close <strong>all active sessions</strong>,
                including this one. You will be redirected to the login page and must
                sign in again with your new password.
              </span>
            </div>
          </Alert>

          <Form.Group className="mb-3" controlId="currentPassword">
            <Form.Label className="fw-medium">Current password</Form.Label>
            <Form.Control
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="newPassword">
            <Form.Label className="fw-medium">New password</Form.Label>
            <Form.Control
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            <Form.Text className="text-body-secondary">
              At least 8 characters with one uppercase letter, one lowercase letter,
              one number and one special character.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-0" controlId="confirmNewPassword">
            <Form.Label className="fw-medium">Confirm new password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
