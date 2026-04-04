import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import adminService from "../../services/adminService";

const SystemMessageModal = ({ context = "afterLogin" }) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSystemMessage = async () => {
      try {
        const config = await adminService.getPublicConfig();
        const sysMsg = config.systemMessage;
        if (sysMsg && sysMsg.enabled && sysMsg.message) {
          const shouldShow =
            (context === "afterLogin" && sysMsg.showAfterLogin !== false) ||
            (context === "beforeLogin" && sysMsg.showBeforeLogin === true);
          if (shouldShow) {
            setMessage(sysMsg.message);
            setShow(true);
          }
        }
      } catch (error) {
        // Silently fail - system message is not critical
        console.debug("Could not load system message:", error);
      }
    };

    loadSystemMessage();
  }, [context]);

  if (!message) return null;

  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title>
          <i className="bi bi-megaphone-fill text-primary me-2"></i>
          System Notification
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          className="p-3 rounded"
          style={{ backgroundColor: "var(--bs-info-bg-subtle, #cff4fc)" }}
        >
          {message}
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="primary" onClick={() => setShow(false)}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SystemMessageModal;
