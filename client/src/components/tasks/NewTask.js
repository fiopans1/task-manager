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
  const handleSubmit = async (e) => {
    //TO-DO: Necesitamos comprobar las fechas son correctas, es decir que la fecha de inicio sea menor que la de fin
    //e.preventDefault();
    try {
      // Crear una copia de formData para modificar
      const taskData = { ...formData };

      // Si es un evento, combinar fecha y hora
      if (taskData.isEvent) {
        // Formato ISO para LocalDateTime: YYYY-MM-DDThh:mm:ss
        if (startDateField && startTimeField) {
          taskData.startDate = dayjs(
            `${startDateField}T${startTimeField}`
          ).toISOString();
        }

        if (endDateField && endTimeField) {
          taskData.endDate = dayjs(
            `${endDateField}T${endTimeField}`
          ).toISOString();
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

  const priorityOptions = ["LOW", "MIN", "MEDIUM", "HIGH", "CRITICAL"];
  const statusOptions = [
    "COMPLETED",
    "CANCELLED",
    "IN_PROGRESS",
    "NEW",
    "PAUSSED",
  ];

  return (
    <Container>
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        centered
        className="task-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary">New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <Container>
            <Col>
              <Form onSubmit={handleSubmit}>
                <Form.Group
                  className="mb-4"
                  controlId="exampleForm.ControlInput1"
                >
                  <Form.Label className="text-secondary fw-medium">
                    Name
                  </Form.Label>
                  <Form.Control
                    type="title"
                    placeholder="Name of task"
                    name="nameOfTask"
                    value={formData.nameOfTask}
                    onChange={handleChange}
                    className="shadow-sm rounded-3 border-light-subtle"
                  />
                </Form.Group>
                <Row className="mb-4">
                  <Col>
                    <Form.Group controlId="formPriority">
                      <Form.Label className="text-secondary fw-medium">
                        Priority
                      </Form.Label>
                      <Form.Select
                        aria-label="Priority"
                        name="priority"
                        onChange={handleChange}
                        value={formData.priority}
                        className="shadow-sm rounded-3 border-light-subtle"
                      >
                        {priorityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="formStatus">
                      <Form.Label className="text-secondary fw-medium">
                        Status
                      </Form.Label>
                      <Form.Select
                        aria-label="Status"
                        name="state"
                        onChange={handleChange}
                        value={formData.state}
                        className="shadow-sm rounded-3 border-light-subtle"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
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
                  className="mb-3 form-switch-lg text-secondary fw-medium"
                />
                <Collapse in={isEvent}>
                  <Container className="mb-4 bg-light rounded-3 p-3 border border-light-subtle">
                    <Row>
                      <Form.Group
                        controlId="formDate"
                        className="mb-3"
                        style={{ width: "100%" }}
                      >
                        <Form.Label className="text-secondary fw-medium">
                          Start Event
                        </Form.Label>
                        <Row>
                          <Col>
                            <Form.Control
                              type="date"
                              placeholder="Enter date"
                              value={startDateField}
                              onChange={(e) =>
                                setStartDateField(e.target.value)
                              }
                              className="shadow-sm rounded-3 border-light-subtle"
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
                              className="shadow-sm rounded-3 border-light-subtle"
                            />
                          </Col>
                        </Row>
                      </Form.Group>
                      <Form.Group
                        controlId="formDate"
                        className="mb-3"
                        style={{ width: "100%" }}
                      >
                        <Form.Label className="text-secondary fw-medium">
                          End Event
                        </Form.Label>
                        <Row>
                          <Col>
                            <Form.Control
                              type="date"
                              placeholder="Enter date"
                              value={endDateField}
                              onChange={(e) => setEndDateField(e.target.value)}
                              className="shadow-sm rounded-3 border-light-subtle"
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="time"
                              placeholder="Enter time"
                              value={endTimeField}
                              onChange={(e) => setEndTimeField(e.target.value)}
                              className="shadow-sm rounded-3 border-light-subtle"
                            />
                          </Col>
                        </Row>
                      </Form.Group>
                    </Row>
                  </Container>
                </Collapse>
                <Form.Group
                  className="mb-4"
                  controlId="exampleForm.ControlTextarea1"
                >
                  <Form.Label className="text-secondary fw-medium">
                    Description
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Description....."
                    value={formData.descriptionOfTask}
                    name="descriptionOfTask"
                    onChange={handleChange}
                    className="shadow-sm rounded-3 border-light-subtle"
                  />
                </Form.Group>
              </Form>
            </Col>
          </Container>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="light"
            onClick={handleClose}
            className="rounded-3 px-4 fw-medium"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleClose();
              handleSubmit();
            }}
            className="rounded-3 px-4 fw-medium"
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NewTask;
