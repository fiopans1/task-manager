import React from "react";
import { Modal, Button, Row, Col, Card, Badge } from "react-bootstrap";
import configService from "../../services/configService";
import { useTranslation } from 'react-i18next';

const About = ({ show, handleClose }) => {
  const { t } = useTranslation();
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
          {t('about.title', { appName: configService.getAppName() })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 py-4">
        <div className="text-center mb-4">
          <div className="mb-3">
            <i className="bi bi-speedometer2 display-1 text-primary"></i>
          </div>
          <h4 className="fw-bold">{configService.getAppName()}: {configService.getAppLicense()}</h4>
          <p className="text-muted">
            {t('about.subtitle')}
          </p>
          <Badge
            bg="body-tertiary"
            text="body"
            className="border px-3 py-2 rounded-pill"
          >
            {t('about.version', { version: configService.getAppVersion() })}
          </Badge>
        </div>

        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm bg-body-tertiary">
              <Card.Body className="text-center">
                <i className="bi bi-check-circle-fill fs-1 text-success mb-3"></i>
                <h6 className="fw-bold">{t('about.taskTracking')}</h6>
                <p className="small text-muted mb-0">
                  {t('about.taskTrackingDesc')}
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm bg-body-tertiary">
              <Card.Body className="text-center">
                <i className="bi bi-calendar-check-fill fs-1 text-warning mb-3"></i>
                <h6 className="fw-bold">{t('about.calendarView')}</h6>
                <p className="small text-muted mb-0">
                  {t('about.calendarViewDesc')}
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm bg-body-tertiary">
              <Card.Body className="text-center">
                <i className="bi bi-shield-lock-fill fs-1 text-info mb-3"></i>
                <h6 className="fw-bold">{t('about.securePrivate')}</h6>
                <p className="small text-muted mb-0">
                  {t('about.securePrivateDesc')}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="text-center pt-3 border-top">
          <p className="small text-muted mb-1">
            {t('about.designedBy')}{" "}
            <span className="fw-bold text-body">fiopans1</span>
          </p>
          <p className="small text-muted">
            &copy; {new Date().getFullYear()} {t('about.allRights')}
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 justify-content-center pb-4">
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          className="px-4 rounded-pill"
        >
          {t('about.close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default About;
