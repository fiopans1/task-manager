import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import adminService from "../../services/adminService";
import { successToast, errorToast } from "../common/Noty";

const SystemMessageTab = () => {
  const [message, setMessage] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [showBeforeLogin, setShowBeforeLogin] = useState(false);
  const [showAfterLogin, setShowAfterLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getSystemMessage();
        setMessage(data.message || "");
        setEnabled(data.enabled || false);
        setShowBeforeLogin(data.showBeforeLogin || false);
        setShowAfterLogin(data.showAfterLogin !== false);
      } catch (error) {
        errorToast("Error loading system message");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await adminService.updateSystemMessage(message, enabled, showBeforeLogin, showAfterLogin);
      setMessage(updated.message || "");
      setEnabled(updated.enabled || false);
      setShowBeforeLogin(updated.showBeforeLogin || false);
      setShowAfterLogin(updated.showAfterLogin !== false);
      successToast("System message updated");
    } catch (error) {
      errorToast("Error saving system message");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white">
        <h5 className="mb-0">
          <i className="bi bi-megaphone me-2"></i>System Message
        </h5>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-3">
          Configure a message that will be displayed to users. You can choose
          to show it before login (on the login/home page), after login, or both.
        </p>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Enable Message</Form.Label>
          <Form.Check
            type="switch"
            id="system-message-switch"
            label={enabled ? "Message is active" : "Message is inactive"}
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Visibility</Form.Label>
          <Form.Check
            type="checkbox"
            id="show-before-login"
            label="Show before login (on login/home page)"
            checked={showBeforeLogin}
            onChange={(e) => setShowBeforeLogin(e.target.checked)}
          />
          <Form.Check
            type="checkbox"
            id="show-after-login"
            label="Show after login (inside application)"
            checked={showAfterLogin}
            onChange={(e) => setShowAfterLogin(e.target.checked)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Message Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Enter the message to display to users..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Form.Group>

        {message && (
          <Alert variant="info" className="mb-3">
            <Alert.Heading className="h6">
              <i className="bi bi-eye me-2"></i>Preview
            </Alert.Heading>
            {message}
          </Alert>
        )}

        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Saving...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-2"></i>
              Save Message
            </>
          )}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default SystemMessageTab;
