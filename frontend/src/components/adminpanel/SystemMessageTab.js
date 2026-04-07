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
import { useTranslation } from 'react-i18next';

const SystemMessageTab = () => {
  const { t } = useTranslation();
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
          <i className="bi bi-megaphone me-2"></i>{t('systemMessage.title')}
        </h5>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-3">
          {t('systemMessage.description')}
        </p>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">{t('systemMessage.enableMessage')}</Form.Label>
          <Form.Check
            type="switch"
            id="system-message-switch"
            label={enabled ? t('systemMessage.messageActive') : t('systemMessage.messageInactive')}
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">{t('systemMessage.visibility')}</Form.Label>
          <Form.Check
            type="checkbox"
            id="show-before-login"
            label={t('systemMessage.showBeforeLogin')}
            checked={showBeforeLogin}
            onChange={(e) => setShowBeforeLogin(e.target.checked)}
          />
          <Form.Check
            type="checkbox"
            id="show-after-login"
            label={t('systemMessage.showAfterLogin')}
            checked={showAfterLogin}
            onChange={(e) => setShowAfterLogin(e.target.checked)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">{t('systemMessage.messageContent')}</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            placeholder={t('systemMessage.messagePlaceholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Form.Group>

        {message && (
          <Alert variant="info" className="mb-3">
            <Alert.Heading className="h6">
              <i className="bi bi-eye me-2"></i>{t('systemMessage.preview')}
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
              {t('systemMessage.saving')}
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-2"></i>
              {t('systemMessage.saveMessage')}
            </>
          )}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default SystemMessageTab;
