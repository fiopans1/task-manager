import React from "react";
import { Modal, Button, Row, Col, Card, Badge } from "react-bootstrap";
import configService from "../../services/configService";

const About = ({ show, handleClose }) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      className="about-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center fw-bold text-primary">
          <i className="bi bi-info-circle-fill me-2"></i>
          About {configService.getAppName()}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 py-4">
        <div className="text-center mb-4">
          <div className="mb-3">
            <i className="bi bi-speedometer2 display-1 text-primary"></i>
          </div>
          <h4 className="fw-bold">{configService.getAppName()}: {configService.getAppLicense()}</h4>
          <p className="text-muted">
            Simplify your workflow, organize your life.
          </p>
          <Badge
            bg="light"
            text="dark"
            className="border px-3 py-2 rounded-pill"
          >
            Version {configService.getAppVersion()}
          </Badge>
        </div>

        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm bg-light">
              <Card.Body className="text-center">
                <i className="bi bi-check-circle-fill fs-1 text-success mb-3"></i>
                <h6 className="fw-bold">Task Tracking</h6>
                <p className="small text-muted mb-0">
                  Manage your daily tasks efficiently with our intuitive
                  interface.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm bg-light">
              <Card.Body className="text-center">
                <i className="bi bi-calendar-check-fill fs-1 text-warning mb-3"></i>
                <h6 className="fw-bold">Calendar View</h6>
                <p className="small text-muted mb-0">
                  Visualize your schedule and never miss a deadline again.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm bg-light">
              <Card.Body className="text-center">
                <i className="bi bi-shield-lock-fill fs-1 text-info mb-3"></i>
                <h6 className="fw-bold">Secure & Private</h6>
                <p className="small text-muted mb-0">
                  Your data is encrypted and stored securely.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="text-center pt-3 border-top">
          <p className="small text-muted mb-1">
            Designed & Developed by{" "}
            <span className="fw-bold text-dark">fiopans1</span>
          </p>
          <p className="small text-muted">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 justify-content-center pb-4">
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          className="px-4 rounded-pill"
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default About;
