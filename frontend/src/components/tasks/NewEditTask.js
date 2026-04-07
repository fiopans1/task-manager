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
import { useTranslation } from "react-i18next";
import taskService from "../../services/taskService";
import { successToast, errorToast } from "../common/Noty";
import dayjs from "dayjs";

const NewEditTask = ({
  show,
  handleClose,
  refreshTasks,
  editOrNew,
  initialData,
  onSave,
}) => {
  const { t } = useTranslation();
  const [isEvent, setIsEvent] = useState(false);
  const [validated, setValidated] = useState(false);
  const [dateError, setDateError] = useState("");

  const [formData, setFormData] = useState({
    nameOfTask: "",
    descriptionOfTask: "",
    state: "NEW",
    priority: "MIN",
    isEvent: false,
    startDate: "",
    endDate: "",
    id: null,
  });

  // Date and time fields
  const [startDateField, setStartDateField] = useState("");
  const [startTimeField, setStartTimeField] = useState("");
  const [endDateField, setEndDateField] = useState("");
  const [endTimeField, setEndTimeField] = useState("");

  const restartForm = () => {
    setFormData({
      nameOfTask: "",
      descriptionOfTask: "",
      state: "NEW",
      priority: "MIN",
      isEvent: false,
      startDate: "",
      endDate: "",
      id: null,
    });
    setIsEvent(false);
    setValidated(false);
    setDateError("");
    setStartDateField("");
    setStartTimeField("");
    setEndDateField("");
    setEndTimeField("");
  };

  // Update form when initialData changes (edit mode)
  useEffect(() => {
    if (editOrNew && initialData && Object.keys(initialData).length > 0) {
      setFormData({
        nameOfTask: initialData.nameOfTask || "",
        descriptionOfTask: initialData.descriptionOfTask || "",
        state: initialData.state || "NEW",
        priority: initialData.priority || "MIN",
        isEvent: initialData.isEvent || false,
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        id: initialData.id || null,
      });

      setIsEvent(initialData.isEvent || false);

      // Parse and set date/time fields if event
      if (initialData.isEvent && initialData.startDate) {
        const startDate = dayjs(initialData.startDate);
        setStartDateField(startDate.format("YYYY-MM-DD"));
        setStartTimeField(startDate.format("HH:mm"));
      } else {
        setStartDateField("");
        setStartTimeField("");
      }

      if (initialData.isEvent && initialData.endDate) {
        const endDate = dayjs(initialData.endDate);
        setEndDateField(endDate.format("YYYY-MM-DD"));
        setEndTimeField(endDate.format("HH:mm"));
      } else {
        setEndDateField("");
        setEndTimeField("");
      }

      setValidated(false);
      setDateError("");
    }
  }, [initialData, editOrNew]);

  const handleEvent = () => {
    const newIsEvent = !isEvent;
    setIsEvent(newIsEvent);
    setFormData((prevData) => ({
      ...prevData,
      isEvent: newIsEvent,
    }));
    if (!newIsEvent) {
      setDateError("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.nameOfTask || formData.nameOfTask.trim() === "") {
      return false;
    }

    if (isEvent) {
      if (!startDateField || !startTimeField || !endDateField || !endTimeField) {
        setDateError("All event date and time fields are required");
        return false;
      }

      const startDateTime = dayjs(`${startDateField}T${startTimeField}`);
      const endDateTime = dayjs(`${endDateField}T${endTimeField}`);
      if (endDateTime.isBefore(startDateTime)) {
        setDateError("End date must be after start date");
        return false;
      }
      setDateError("");
    }

    return true;
  };

  const handleSubmit = async () => {
    setValidated(true);

    if (!validateForm()) {
      return false;
    }

    try {
      // Create a copy of formData to modify
      const taskData = { ...formData };

      // If it's an event, combine date and time
      if (taskData.isEvent) {
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

      if (onSave) {
        await onSave(taskData);
        successToast(editOrNew ? "Task updated successfully" : "Task created successfully");
      } else if (editOrNew) {
        if (!taskData.id) {
          errorToast("Error: Task ID is missing for update");
          return false;
        }
        await taskService.editTask(taskData);
        successToast("Task updated successfully");
      } else {
        await taskService.createTask(taskData);
        successToast("Task created successfully");
      }

      if (!editOrNew) {
        restartForm();
      }
      refreshTasks();
      return true;
    } catch (error) {
      errorToast("Error: " + error.message);
      return false;
    }
  };

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
          <Modal.Title className="fw-bold text-primary">
            {editOrNew ? t('newEditTask.editTask') : t('newEditTask.newTask')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <Container>
            <Col>
              <Form>
                <Form.Group className="mb-4" controlId="taskNameInput">
                  <Form.Label className="text-secondary fw-medium">
                    {t('newEditTask.name')}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('newEditTask.namePlaceholder')}
                    name="nameOfTask"
                    value={formData.nameOfTask}
                    onChange={handleChange}
                    className="shadow-sm rounded-3 border-light-subtle"
                    required
                    isInvalid={validated && (!formData.nameOfTask || formData.nameOfTask.trim() === "")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {t('newEditTask.nameRequired')}
                  </Form.Control.Feedback>
                </Form.Group>
                <Row className="mb-4">
                  <Col>
                    <Form.Group controlId="formPriority">
                      <Form.Label className="text-secondary fw-medium">
                        {t('newEditTask.priority')}
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
                            {t('priorities.' + option)}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="formStatus">
                      <Form.Label className="text-secondary fw-medium">
                        {t('newEditTask.status')}
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
                            {t('states.' + option)}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Check
                  type="switch"
                  id="event-switch"
                  label={t('newEditTask.isEvent')}
                  checked={isEvent}
                  onChange={handleEvent}
                  className="mb-3 form-switch-lg text-secondary fw-medium"
                />
                <Collapse in={isEvent}>
                  <Container className="mb-4 bg-body-tertiary rounded-3 p-3 border border-light-subtle">
                    <Row>
                      <Form.Group
                        controlId="formStartDate"
                        className="mb-3"
                        style={{ width: "100%" }}
                      >
                        <Form.Label className="text-secondary fw-medium">
                          {t('newEditTask.startEvent')}
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
                        controlId="formEndDate"
                        className="mb-3"
                        style={{ width: "100%" }}
                      >
                        <Form.Label className="text-secondary fw-medium">
                          {t('newEditTask.endEvent')}
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
                    {dateError && (
                      <div className="text-danger small mt-1">{dateError}</div>
                    )}
                  </Container>
                </Collapse>
                <Form.Group className="mb-4" controlId="taskDescription">
                  <Form.Label className="text-secondary fw-medium">
                    {t('newEditTask.description')}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder={t('newEditTask.descriptionPlaceholder')}
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
            {t('newEditTask.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              const success = await handleSubmit();
              if (success) {
                handleClose();
              }
            }}
            className="rounded-3 px-4 fw-medium"
          >
            {editOrNew ? t('newEditTask.saveChanges') : t('newEditTask.create')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NewEditTask;
