import React from "react";
import {
  Container,
  Col,
  Form,
  Modal,
  Button,
  Row,
  Collapse,
} from "react-bootstrap";
import { useState } from "react";
const NewTask = ({ show, handleClose, handleShow }) => {
  const [isEvent, setIsEvent] = useState(false);

  const handleEvent = () => {
    setIsEvent(!isEvent);
  };

  const formatToISO = ({ date, time }) => {
    if (!date || !time) return null;

    // Convertimos a objeto Date en la zona horaria local
    const isoString = new Date(`${date}T${time}:00`).toISOString();
    return isoString; // Devuelve formato ISO
  };
  return (
    <Container>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Col>
              <Form>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1"
                >
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="title" placeholder="Title of task" />
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group controlId="formPriority" className="mb-3">
                      <Form.Label>Priority</Form.Label>
                      <Form.Select aria-label="Priority">
                        <option value="1">High</option>
                        <option value="2">Low</option>
                        <option value="3">Medium</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="formPriority" className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select aria-label="Priority">
                        <option value="1">In Progress</option>
                        <option value="2">Clossed</option>
                        <option value="3">Finished</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Check
                  type="switch"
                  id="custom-switch"
                  label="Is an Event?"
                  checked={isEvent}
                  onChange={handleEvent}
                />
                <Collapse in={isEvent}>
                  <Container>
                    <Row>
                      <Form.Group
                        controlId="formDate"
                        className="mb-3"
                        style={{ width: "100%" }}
                      >
                        <Form.Label>Start Event</Form.Label>
                        <Row>
                          <Col>
                            <Form.Control
                              type="date"
                              placeholder="Enter date"
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="time"
                              placeholder="Enter time"
                            />
                          </Col>
                        </Row>
                      </Form.Group>
                      <Form.Group
                        controlId="formDate"
                        className="mb-3"
                        style={{ width: "100%" }}
                      >
                        <Form.Label>End Event</Form.Label>
                        <Row>
                          <Col>
                            <Form.Control
                              type="date"
                              placeholder="Enter date"
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="time"
                              placeholder="Enter time"
                            />
                          </Col>
                        </Row>
                      </Form.Group>
                    </Row>
                  </Container>
                </Collapse>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextarea1"
                >
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Description....."
                  />
                </Form.Group>
              </Form>
            </Col>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ssecondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NewTask;
