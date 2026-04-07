import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import listService from "../../services/listService";

const Lists = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State to manage cards
  const [cards, setCards] = useState([]);
  
  // State for the new task modal
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    color: "#0d6efd" // Default blue color
  });

  // Load initial data
  useEffect(() => {
    // Simulando datos iniciales
    const initialCards = Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      title: `Proyecto ${index + 1}`,
      description: `Tasks related to project ${index + 1}`,
      color: "#0d6efd",
      tasksCompleted: Math.floor(Math.random() * 3),
      totalTasks: 3
    }));
    
    setCards(initialCards);
  }, []);

  // Handle card click to navigate
  const handleCardClick = (id) => {
    navigate(`${location.pathname}/${id}`);
  };

  // Open modal for new task
  const handleAddNewTask = () => {
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setNewTask({ title: "", description: "", color: "#0d6efd" });
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  // Save new task
  const handleSaveTask = () => {
    if (newTask.title.trim() === "") return;
    
    if (newTask.id) {
      // Update existing task
      setCards(prev => prev.map(card => 
        card.id === newTask.id ? { ...card, ...newTask } : card
      ));
    } else {
      // Create new task
      const newCard = {
        id: cards.length > 0 ? Math.max(...cards.map(c => c.id)) + 1 : 1,
        title: newTask.title,
        description: newTask.description || t('listsExample.noDescription'),
        color: newTask.color,
        tasksCompleted: 0,
        totalTasks: 3
      };
      
      setCards(prev => [newCard, ...prev]);
    }
    
    handleCloseModal();
  };

  // Delete card
  const handleDeleteCard = (id, e) => {
    e.stopPropagation();
    setCards(prev => prev.filter(card => card.id !== id));
  };

  // Edit card (opens modal with existing data)
  const handleEditCard = (card, e) => {
    e.stopPropagation();
    setNewTask({
      id: card.id,
      title: card.title,
      description: card.description,
      color: card.color
    });
    setShowModal(true);
  };

  return (
    <Container fluid className="overflow-auto" style={{ height: "100vh" }}>
      <div className="tittle-tab-container">
        <h2>{t('listsExample.title')}</h2>
      </div>
      
      <Row className="m-1 mb-4 mt-3">
        {/* Card to create new task */}
        <Card 
          className="border-primary text-center hover-shadow" 
          style={{ cursor: "pointer" }}
          onClick={handleAddNewTask}
        >
          <Card.Body className="py-4">
            <Card.Title>
              <i className="bi bi-plus-lg"></i> {t('listsExample.createNewTask')}
            </Card.Title>
          </Card.Body>
        </Card>
      </Row>

      {/* Dynamic cards */}
      {cards.map((card) => (
        <Row key={card.id} className="m-1">
          <Card 
            style={{ borderTop: `6px solid ${card.color}` }}
            className="w-100 mb-2 hover-shadow"
          >
            <Card.Body>
              <div className="d-flex">
                <div className="flex-grow-1">
                  <Card.Subtitle className="mt-0 mb-0 fw-bold">
                    {card.title}
                  </Card.Subtitle>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCard(card, e);
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCard(card.id, e);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
              <Row>
                <Card.Text className="mt-2 mb-0" style={{ fontSize: "13px" }}>
                  {card.description}
                </Card.Text>
                <Card.Text
                  className="mb-1"
                  style={{ fontSize: "0.7rem", color: "#6b7280" }}
                >
                  {t('listsExample.completedTasks', { completed: card.tasksCompleted, total: card.totalTasks })}
                </Card.Text>
                <Button
                  variant="success"
                  className="m-2"
                  onClick={() => handleCardClick(card.id)}
                >
                  <i className="bi bi-card-checklist me-1"></i>
                  {t('listsExample.seeList')}
                </Button>
              </Row>
            </Card.Body>
          </Card>
        </Row>
      ))}

      {/* Modal for adding/editing task */}
     <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{newTask.id ? t('listsExample.editList') : t('listsExample.newTaskList')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('listsExample.titleLabel')}</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                placeholder={t('listsExample.titlePlaceholder')}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('listsExample.descriptionLabel')}</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={newTask.description}
                onChange={handleInputChange}
                placeholder={t('listsExample.descriptionPlaceholder')}
                rows={3}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('listsExample.colorLabel')}</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="color"
                  value={newTask.color}
                  onChange={handleInputChange}
                  title={t('listsExample.colorTooltip')}
                  className="me-2"
                />
                <div 
                  className="flex-grow-1 rounded" 
                  style={{ backgroundColor: newTask.color, height: '38px' }}
                ></div>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t('listsExample.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSaveTask}>
            {newTask.id ? t('listsExample.update') : t('listsExample.createList')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Lists;