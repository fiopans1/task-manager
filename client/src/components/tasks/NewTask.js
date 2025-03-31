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
import taskervice from "../../services/taskService";
import { successToast, errorToast } from "../common/Noty";
import dayjs from "dayjs";
const NewTask = ({ show, handleClose, refreshTasks }) => {
  const [isEvent, setIsEvent] = useState(false);

  const handleEvent = () => {
    const newIsEvent = !isEvent;
    setIsEvent(newIsEvent);
    setFormData((prevData) => ({
      ...prevData,
      isEvent: newIsEvent,
    }));
  };
  const [formData, setFormData] = useState({
    nameOfTask: "",
    descriptionOfTask: "",
    state: "NEW",
    priority: "MIN",
    isEvent: false,
    startDate: "",
    endDate: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e) => { //TO-DO: Necesitamos comprobar las fechas son correctas, es decir que la fecha de inicio sea menor que la de fin
    //e.preventDefault();
    try {
      // Crear una copia de formData para modificar
      const taskData = { ...formData };

      // Si es un evento, combinar fecha y hora
      if (taskData.isEvent) {
        // Formato ISO para LocalDateTime: YYYY-MM-DDThh:mm:ss
        if (startDateField && startTimeField) {
          taskData.startDate = dayjs(`${startDateField}T${startTimeField}`).toISOString();;
        }

        if (endDateField && endTimeField) {
          taskData.endDate = dayjs(`${endDateField}T${endTimeField}`).toISOString();
        }
      }
      await taskervice.createTask(taskData);
      refreshTasks();
      successToast("Task created succesfully");
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  // Añadir estas variables para controlar los campos de fecha y hora
  const [startDateField, setStartDateField] = useState("");
  const [startTimeField, setStartTimeField] = useState("");
  const [endDateField, setEndDateField] = useState("");
  const [endTimeField, setEndTimeField] = useState("");

  return (
    <Container>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Col>
              <Form onSubmit={handleSubmit}>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1"
                >
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="title"
                    placeholder="Name of task"
                    name="nameOfTask"
                    value={formData.nameOfTask}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group controlId="formPriority" className="mb-3">
                      <Form.Label>Priority</Form.Label>
                      <Form.Select
                        aria-label="Priority"
                        name="priority"
                        onChange={handleChange}
                        value={formData.priority}
                        defaultValue={formData.priority}
                      >
                        <option value="MIN">MIN</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="formPriority" className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        aria-label="Priority"
                        name="state"
                        onChange={handleChange}
                        value={formData.state}
                        defaultValue={formData.state}
                      >
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="NEW">NEW</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
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
                              value={startDateField}
                              onChange={(e) =>
                                setStartDateField(e.target.value)
                              }
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="time"
                              placeholder="Enter time"
                              value={startTimeField}
                              onChange={(e) =>
                                setStartTimeField(e.target.value)
                              }
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
                              value={endDateField}
                              onChange={(e) => setEndDateField(e.target.value)}
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="time"
                              placeholder="Enter time"
                              value={endTimeField}
                              onChange={(e) => setEndTimeField(e.target.value)}
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
                    value={formData.descriptionOfTask}
                    name="descriptionOfTask"
                    onChange={handleChange}
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
          <Button
            variant="primary"
            onClick={() => {
              handleClose();
              handleSubmit();
            }}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NewTask;
