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
import { useState, useEffect } from "react";
import taskService from "../../services/taskService";
import { successToast, errorToast } from "../common/Noty";
import dayjs from "dayjs";

const EditTask = ({ show, handleClose, refreshTasks, initialData }) => {
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
    id: "",
  });

  // Initialize date and time fields
  const [startDateField, setStartDateField] = useState("");
  const [startTimeField, setStartTimeField] = useState("");
  const [endDateField, setEndDateField] = useState("");
  const [endTimeField, setEndTimeField] = useState("");

  // Update form when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        nameOfTask: initialData.nameOfTask || "",
        descriptionOfTask: initialData.descriptionOfTask || "",
        state: initialData.state || "NEW",
        priority: initialData.priority || "MIN",
        isEvent: initialData.isEvent || false,
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        id: initialData.id || "",
      });

      setIsEvent(initialData.isEvent || false);

      // Parse and set date/time fields if event
      if (initialData.isEvent && initialData.startDate) {
        const startDate = dayjs(initialData.startDate);
        setStartDateField(startDate.format("YYYY-MM-DD"));
        setStartTimeField(startDate.format("HH:mm"));
      }

      if (initialData.isEvent && initialData.endDate) {
        const endDate = dayjs(initialData.endDate);
        setEndDateField(endDate.format("YYYY-MM-DD"));
        setEndTimeField(endDate.format("HH:mm"));
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      // Create a copy of formData for modification
      const taskData = { ...formData };

      // If it's an event, combine date and time
      if (taskData.isEvent) {
        // ISO format for LocalDateTime: YYYY-MM-DDThh:mm:ss
        if (startDateField && startTimeField) {
          taskData.startDate = dayjs(`${startDateField}T${startTimeField}`).toISOString();
        }

        if (endDateField && endTimeField) {
          taskData.endDate = dayjs(`${endDateField}T${endTimeField}`).toISOString();
        }
      }

      await taskService.editTask(taskData);
      refreshTasks();
      successToast("Task updated successfully");
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  return (
    <Container>
      <Modal show={show} onHide={handleClose} size="lg" centered className="task-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary">Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <Container>
            <Col>
              <Form>
                <Form.Group
                  className="mb-4"
                  controlId="editTaskNameInput"
                >
                  <Form.Label className="text-secondary fw-medium">Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Name of task"
                    name="nameOfTask"
                    value={formData.nameOfTask}
                    onChange={handleChange}
                    className="shadow-sm rounded-3 border-light-subtle"
                  />
                </Form.Group>
                <Row className="mb-4">
                  <Col>
                    <Form.Group controlId="editFormPriority">
                      <Form.Label className="text-secondary fw-medium">Priority</Form.Label>
                      <Form.Select
                        aria-label="Priority"
                        name="priority"
                        onChange={handleChange}
                        value={formData.priority}
                        className="shadow-sm rounded-3 border-light-subtle"
                      >
                        <option value="MIN">MIN</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="editFormStatus">
                      <Form.Label className="text-secondary fw-medium">Status</Form.Label>
                      <Form.Select
                        aria-label="Status"
                        name="state"
                        onChange={handleChange}
                        value={formData.state}
                        className="shadow-sm rounded-3 border-light-subtle"
                      >
                        <option value="NEW">NEW</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Check
                  type="switch"
                  id="edit-event-switch"
                  label="Is an Event?"
                  checked={isEvent}
                  onChange={handleEvent}
                  className="mb-3 form-switch-lg text-secondary fw-medium"
                />
                <Collapse in={isEvent}>
                  <Container className="mb-4 bg-light rounded-3 p-3 border border-light-subtle">
                    <Row>
                      <Form.Group
                        controlId="editFormStartDate"
                        className="mb-3"
                        style={{ width: "100%" }}
                      >
                        <Form.Label className="text-secondary fw-medium">Start Event</Form.Label>
                        <Row>
                          <Col>
                            <Form.Control
                              type="date"
                              placeholder="Enter date"
                              value={startDateField}
                              onChange={(e) => setStartDateField(e.target.value)}
                              className="shadow-sm rounded-3 border-light-subtle"
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="time"
                              placeholder="Enter time"
                              value={startTimeField}
                              onChange={(e) => setStartTimeField(e.target.value)}
                              className="shadow-sm rounded-3 border-light-subtle"
                            />
                          </Col>
                        </Row>
                      </Form.Group>
                      <Form.Group
                        controlId="editFormEndDate"
                        className="mb-3"
                        style={{ width: "100%" }}
                      >
                        <Form.Label className="text-secondary fw-medium">End Event</Form.Label>
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
                  controlId="editTaskDescription"
                >
                  <Form.Label className="text-secondary fw-medium">Description</Form.Label>
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
          <Button variant="light" onClick={handleClose} className="rounded-3 px-4 fw-medium">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleSubmit();
              handleClose();
            }}
            className="rounded-3 px-4 fw-medium"
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditTask;