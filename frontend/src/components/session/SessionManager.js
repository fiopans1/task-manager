import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { warningToast, infoToast } from "../common/Noty";
import { useTranslation } from 'react-i18next';

const SESSION_CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds
const WARNING_THRESHOLD = 5 * 60; // 5 minutes in seconds
const COUNTDOWN_DURATION = 60; // 60 seconds countdown in the modal

const SessionManager = ({ onLogOut }) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const navigate = useNavigate();
  const countdownIntervalRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const warningShownRef = useRef(false);

  const handleForceLogout = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    setShowModal(false);
    warningShownRef.current = false;
    onLogOut();
    navigate("/login", { replace: true });
  }, [onLogOut, navigate]);

  const handleExtendSession = useCallback(async () => {
    try {
      await authService.refreshToken();
      setShowModal(false);
      setCountdown(COUNTDOWN_DURATION);
      warningShownRef.current = false;
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      infoToast("Session extended successfully");
    } catch (error) {
      warningToast("Could not extend session. Please log in again.");
      handleForceLogout();
    }
  }, [handleForceLogout]);

  // Start countdown when modal is shown
  useEffect(() => {
    if (showModal) {
      setCountdown(COUNTDOWN_DURATION);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [showModal]);

  // Auto-logout when countdown reaches 0
  useEffect(() => {
    if (showModal && countdown === 0) {
      warningToast("Session expired. You have been logged out.");
      handleForceLogout();
    }
  }, [countdown, showModal, handleForceLogout]);

  // Periodic session check
  useEffect(() => {
    const checkSession = () => {
      const timeRemaining = authService.getTokenTimeRemaining();

      // Token already expired
      if (timeRemaining <= 0) {
        handleForceLogout();
        return;
      }

      // Token about to expire - show warning
      if (timeRemaining <= WARNING_THRESHOLD && !warningShownRef.current) {
        warningShownRef.current = true;
        setShowModal(true);
      }
    };

    // Check immediately on mount
    checkSession();

    // Set up periodic check
    checkIntervalRef.current = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [handleForceLogout]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      show={showModal}
      onHide={handleExtendSession}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title>
          <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
          {t('session.expiring')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('session.expiringMessage')}</p>
        <p className="text-center">
          <span className="fs-3 fw-bold text-danger">
            {formatTime(countdown)}
          </span>
        </p>
        <p className="text-muted text-center small">
          {t('session.autoLogout')}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleForceLogout}>
          {t('session.logout')}
        </Button>
        <Button variant="primary" onClick={handleExtendSession}>
          {t('session.extendSession')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SessionManager;
