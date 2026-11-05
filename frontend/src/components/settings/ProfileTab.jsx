import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import authService from "../../services/authService";
import profileService from "../../services/profileService";
import { errorToast, successToast } from "../common/Noty";
import ChangePasswordModal from "./ChangePasswordModal";

const EMPTY_FORM = {
  name: "",
  surname1: "",
  surname2: "",
  username: "",
  email: "",
};

const ProfileTab = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    let active = true;

    profileService
      .getProfile()
      .then((data) => {
        if (!active) {
          return;
        }
        setProfile(data);
        setForm({
          name: data.name || "",
          surname1: data.surname1 || "",
          surname2: data.surname2 || "",
          username: data.username || "",
          email: data.email || "",
        });
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        const message = error.response?.data?.message || "Could not load your profile";
        setLoadError(message);
        errorToast(message);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const session = await profileService.updateProfile(form);
      authService.updateSession(session);
      setProfile((current) => ({
        ...current,
        username: session.user?.username || form.username,
        email: session.user?.email || form.email,
        displayName: session.user?.displayName || current?.displayName,
        name: form.name,
        surname1: form.surname1,
        surname2: form.surname2,
      }));
      successToast("Profile updated successfully");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Could not update your profile";
      errorToast(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="text-body-secondary mt-3 mb-0">Loading profile...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <Alert variant="danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {loadError}
      </Alert>
    );
  }

  const canChangeEmail = profile?.canChangeEmail !== false;
  const canChangePassword = profile?.canChangePassword === true;

  return (
    <>
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Card.Title className="fw-semibold mb-1">Personal information</Card.Title>
          <Card.Subtitle className="text-body-secondary mb-4">
            Update the name, username and email associated with your account.
          </Card.Subtitle>

          <Form onSubmit={handleSubmit}>
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Group controlId="profileName">
                  <Form.Label className="fw-medium">First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="profileSurname1">
                  <Form.Label className="fw-medium">Surname 1</Form.Label>
                  <Form.Control
                    type="text"
                    name="surname1"
                    value={form.surname1}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="profileSurname2">
                  <Form.Label className="fw-medium">Surname 2</Form.Label>
                  <Form.Control
                    type="text"
                    name="surname2"
                    value={form.surname2}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Group controlId="profileUsername">
                  <Form.Label className="fw-medium">Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="profileEmail">
                  <Form.Label className="fw-medium">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!canChangeEmail}
                    required
                  />
                  {!canChangeEmail && (
                    <Form.Text className="text-body-secondary">
                      Your email is managed by your sign-in provider.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Save changes
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Card.Title className="fw-semibold mb-1">Password</Card.Title>
          <Card.Subtitle className="text-body-secondary mb-3">
            Choose a strong password you do not use anywhere else.
          </Card.Subtitle>

          {canChangePassword ? (
            <Button
              variant="outline-primary"
              onClick={() => setShowPasswordModal(true)}
            >
              <i className="bi bi-key me-2"></i>
              Change password
            </Button>
          ) : (
            <Alert variant="secondary" className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Your password is managed by your sign-in provider.
            </Alert>
          )}
        </Card.Body>
      </Card>

      <ChangePasswordModal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
      />
    </>
  );
};

export default ProfileTab;
