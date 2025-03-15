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
  const [isEvent, setIsEvent] = useState(false);

  const [formData, setData] = useState(initialData || {});
  const handleEvent = () => {
    setIsEvent(!isEvent);
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
      //TO-DO: Validar que los campos no estén vacíos y mas cosas, y una vez creada vaciar campos
      await taskervice.editTask(formData);
      refreshTasks();
      successToast("Task edited succesfully");
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  // const formatToISO = ({ date, time }) => {
  //   if (!date || !time) return null;

  //   // Convertimos a objeto Date en la zona horaria local
  //   const isoString = new Date(`${date}T${time}:00`).toISOString();
  //   return isoString; // Devuelve formato ISO
  // };
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
