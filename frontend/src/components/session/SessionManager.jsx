import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import authService from "../../services/authService";
import configService from "../../services/configService";
import { warningToast, infoToast } from "../common/Noty";

const SESSION_CHECK_INTERVAL_MS = 5 * 1000;
const COUNTDOWN_DURATION_SECONDS = 60;
const ACTIVITY_THROTTLE_MS = 1000;
const DEFAULT_INACTIVITY_THRESHOLD_MINUTES = 10;

const SessionManager = ({ onLogOut }) => {
    const [showModal, setShowModal] = useState(false);
    const [countdown, setCountdown] = useState(COUNTDOWN_DURATION_SECONDS);
    const countdownIntervalRef = useRef(null);
    const checkIntervalRef = useRef(null);
    const refreshInFlightRef = useRef(false);
    const showModalRef = useRef(false);
    const lastActivityAtRef = useRef(Date.now());
    const lastThrottledActivityAtRef = useRef(0);
    const inactivityThresholdMs = Math.max(
        1,
        Number(configService.getSessionInactivityThresholdMinutes()) || DEFAULT_INACTIVITY_THRESHOLD_MINUTES
    ) * 60 * 1000;

    const clearCountdownInterval = useCallback(() => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
    }, []);

    const clearSessionCheckInterval = useCallback(() => {
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
        }
    }, []);

    const closeIdleModal = useCallback(() => {
        clearCountdownInterval();
        showModalRef.current = false;
        setShowModal(false);
        setCountdown(COUNTDOWN_DURATION_SECONDS);
    }, [clearCountdownInterval]);

    const openIdleModal = useCallback(() => {
        if (showModalRef.current || !authService.isAuthenticated()) {
            return;
        }

        showModalRef.current = true;
        setShowModal(true);
        setCountdown(COUNTDOWN_DURATION_SECONDS);
    }, []);

    const hasExceededInactivityThreshold = useCallback(() => {
        return Date.now() - lastActivityAtRef.current >= inactivityThresholdMs;
    }, [inactivityThresholdMs]);

    const checkIdleState = useCallback(() => {
        if (!authService.isAuthenticated() || showModalRef.current) {
            return;
        }

        if (hasExceededInactivityThreshold()) {
            openIdleModal();
        }
    }, [hasExceededInactivityThreshold, openIdleModal]);

    const recordActivity = useCallback((useThrottle = false) => {
        if (!authService.isAuthenticated() || showModalRef.current) {
            return;
        }

        if (hasExceededInactivityThreshold()) {
            openIdleModal();
            return;
        }

        const now = Date.now();
        if (useThrottle && now - lastThrottledActivityAtRef.current < ACTIVITY_THROTTLE_MS) {
            return;
        }

        lastThrottledActivityAtRef.current = now;
        lastActivityAtRef.current = now;
    }, [hasExceededInactivityThreshold, openIdleModal]);

    const handleForceLogout = useCallback(async () => {
        clearCountdownInterval();
        clearSessionCheckInterval();
        showModalRef.current = false;
        refreshInFlightRef.current = false;
        setShowModal(false);
        setCountdown(COUNTDOWN_DURATION_SECONDS);
        await onLogOut();
    }, [clearCountdownInterval, clearSessionCheckInterval, onLogOut]);

    const handleExtendSession = useCallback(async () => {
        if (refreshInFlightRef.current) {
            return;
        }

        refreshInFlightRef.current = true;
        try {
            await authService.refreshSession();
            lastActivityAtRef.current = Date.now();
            lastThrottledActivityAtRef.current = lastActivityAtRef.current;
            closeIdleModal();
            infoToast("Session extended successfully");
        } catch (error) {
            warningToast("Could not extend session. Please log in again.");
            await handleForceLogout();
        } finally {
            refreshInFlightRef.current = false;
        }
    }, [closeIdleModal, handleForceLogout]);

    useEffect(() => {
        showModalRef.current = showModal;
    }, [showModal]);

    useEffect(() => {
        if (showModal) {
            clearCountdownInterval();
            setCountdown(COUNTDOWN_DURATION_SECONDS);
            countdownIntervalRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearCountdownInterval();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            clearCountdownInterval();
        };
    }, [clearCountdownInterval, showModal]);

    useEffect(() => {
        if (showModal && countdown === 0) {
            warningToast("You were signed out after a period of inactivity.");
            handleForceLogout();
        }
    }, [countdown, showModal, handleForceLogout]);

    useEffect(() => {
        lastActivityAtRef.current = Date.now();
        lastThrottledActivityAtRef.current = lastActivityAtRef.current;

        const handleProtectedActivity = (event) => {
            if (showModalRef.current || !authService.isAuthenticated()) {
                return;
            }

            if (hasExceededInactivityThreshold()) {
                event.preventDefault();
                event.stopPropagation();
                if (typeof event.stopImmediatePropagation === "function") {
                    event.stopImmediatePropagation();
                }
                openIdleModal();
                return;
            }

            recordActivity();
        };

        const handleThrottledActivity = () => {
            recordActivity(true);
        };

        const handleVisibilityOrFocus = () => {
            if (!authService.isAuthenticated()) {
                return;
            }

            checkIdleState();
        };

        const activityEvents = [
            ["pointerdown", handleProtectedActivity, { capture: true }],
            ["keydown", handleProtectedActivity, { capture: true }],
            ["touchstart", handleProtectedActivity, { capture: true }],
            ["mousemove", handleThrottledActivity, { passive: true }],
            ["scroll", handleThrottledActivity, { passive: true }],
            ["focus", handleVisibilityOrFocus],
        ];

        activityEvents.forEach(([eventName, handler, options]) => {
            window.addEventListener(eventName, handler, options);
        });
        document.addEventListener("visibilitychange", handleVisibilityOrFocus);

        checkIdleState();
        checkIntervalRef.current = setInterval(checkIdleState, SESSION_CHECK_INTERVAL_MS);

        return () => {
            activityEvents.forEach(([eventName, handler, options]) => {
                window.removeEventListener(eventName, handler, options);
            });
            document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
            clearSessionCheckInterval();
        };
    }, [checkIdleState, clearSessionCheckInterval, hasExceededInactivityThreshold, openIdleModal, recordActivity]);

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
                    Still There?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>You have been inactive for a while. Do you want to stay signed in?</p>
                <p className="text-center">
                    <span className="fs-3 fw-bold text-danger">
                        {formatTime(countdown)}
                    </span>
                </p>
                <p className="text-muted text-center small">
                    You will be automatically logged out if you do not respond.
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={handleForceLogout}>
                    Logout
                </Button>
                <Button variant="primary" onClick={handleExtendSession}>
                    Extend Session
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SessionManager;
