import { useEffect } from "react";
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

const EditTask = ({ show, handleClose, refreshTasks, initialData }) => {
  const [isEvent, setIsEvent] = useState(initialData.isEvent);

  const [formData, setData] = useState(initialData || {});
  const handleEvent = () => {
    const newIsEvent = !isEvent;
    setIsEvent(newIsEvent);
    setData((prevData) => ({
      ...prevData,
      isEvent: newIsEvent,
    }));
  };
  useEffect(() => {
    setData(initialData || {});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...formData, [name]: value });
  };
  const handleSubmit = async () => {
    try {
      const taskData = { ...formData };

      // Si es un evento, combinar fecha y hora
      if (taskData.isEvent) {
        // Formato ISO para LocalDateTime: YYYY-MM-DDThh:mm:ss
        if (startDateField && startTimeField) {
          taskData.startDate = `${startDateField}T${startTimeField}:00`;
        }

        if (endDateField && endTimeField) {
          taskData.endDate = `${endDateField}T${endTimeField}:00`;
        }
      }
      //TO-DO: Validar que los campos no estén vacíos y mas cosas, y una vez creada vaciar campos
      await taskervice.editTask(taskData);
      refreshTasks();
      successToast("Task edited succesfully");
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  // Función para extraer la fecha de un formato ISO (YYYY-MM-DDThh:mm:ss)
  const extractDateFromISO = (isoString) => {
    if (!isoString) return "";

    // Si es un formato ISO completo (con T)
    if (isoString.includes("T")) {
      return isoString.split("T")[0]; // Retorna la parte antes de la T
    }

    // Si ya es solo una fecha
    return isoString;
  };

  // Función para extraer la hora de un formato ISO (YYYY-MM-DDThh:mm:ss)
  const extractTimeFromISO = (isoString) => {
    if (!isoString) return "";

    // Si es un formato ISO completo (con T)
    if (isoString.includes("T")) {
      // Obtiene la parte después de T y elimina los segundos si existen
      const timePart = isoString.split("T")[1];
      // Retorna solo horas y minutos (elimina segundos y milisegundos)
      return timePart.substring(0, 5);
    }

    // Si es solo una hora
    return isoString;
  };
  useEffect(() => {
    setData(initialData || {});
    
    // También actualizar los campos de fecha y hora
    if (initialData) {
      setIsEvent(initialData.isEvent || false);
      setStartDateField(extractDateFromISO(initialData.startDate || ""));
      setStartTimeField(extractTimeFromISO(initialData.startDate || ""));
      setEndDateField(extractDateFromISO(initialData.endDate || ""));
      setEndTimeField(extractTimeFromISO(initialData.endDate || ""));
    }
  }, [initialData]);
  const [startDateField, setStartDateField] = useState(extractDateFromISO(""));
  const [startTimeField, setStartTimeField] = useState(extractTimeFromISO(""));
  const [endDateField, setEndDateField] = useState(extractDateFromISO(""));
  const [endTimeField, setEndTimeField] = useState(extractTimeFromISO(""));
  return (
    <Container>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
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
            variant="danger"
            onClick={() => {
              handleClose();
              handleSubmit();
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditTask;
