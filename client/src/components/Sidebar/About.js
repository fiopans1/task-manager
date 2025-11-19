import React from "react";
import { Modal, Button } from "react-bootstrap";

const About = ({ show, handleClose }) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="about-modal-dialog"
      contentClassName="about-modal-content"
      backdropClassName="about-modal-backdrop"
    >
      <div className="about-modal-gradient-border">
        <Modal.Header closeButton className="about-modal-header border-0">
          <Modal.Title className="w-100 text-center fw-bold text-white">
            <i className="bi bi-stars me-2 text-warning"></i>
            Task Manager
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="about-modal-body text-center text-white">
          <div className="mb-4">
            <div className="logo-container mb-3">
              <i className="bi bi-speedometer2 display-1 text-gradient"></i>
            </div>
            <h4 className="fw-light mb-3">Premium Edition</h4>
            <p className="text-white-50">
              Manage your tasks with style and efficiency.
            </p>
          </div>

          <div className="tech-stack mb-4">
            <h6 className="text-uppercase text-white-50 mb-3 fs-7 ls-1">
              Powered By
            </h6>
            <div className="d-flex justify-content-center gap-3 fs-3">
              <i className="bi bi-filetype-jsx text-info" title="React"></i>
              <i className="bi bi-bootstrap text-primary" title="Bootstrap"></i>
              <i className="bi bi-filetype-css text-warning" title="CSS3"></i>
              <i className="bi bi-google text-success" title="Google Cloud"></i>
            </div>
          </div>

          <div className="version-info p-3 rounded bg-white-10">
            <small className="text-white-50">Version 2.0.0 (Beta)</small>
            <div className="mt-1">
              <small className="text-white-50">
                Designed with <i className="bi bi-heart-fill text-danger"></i>{" "}
                by the Team
              </small>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="about-modal-footer border-0 justify-content-center pb-4">
          <Button
            variant="outline-light"
            onClick={handleClose}
            className="px-4 rounded-pill"
          >
            Close
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default About;
