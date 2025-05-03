import React, { useState } from 'react';
import { 
  Container, Row, Col, Card, Table, Form, Button, 
  Badge, Tab, Tabs, Modal, InputGroup, ProgressBar
} from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Search, Plus, Pencil, Trash } from 'lucide-react';

// Datos de ejemplo
const taskData = [
  { id: 1, title: 'Diseñar nueva página de inicio', status: 'Pendiente', priority: 'Alta', dueDate: '2025-05-10', listName: 'Diseño Web' },
  { id: 2, title: 'Implementar autenticación OAuth', status: 'En progreso', priority: 'Alta', dueDate: '2025-05-07', listName: 'Desarrollo Backend' },
  { id: 3, title: 'Corregir bug en formulario de contacto', status: 'Completado', priority: 'Media', dueDate: '2025-05-01', listName: 'Bugs' },
  { id: 4, title: 'Optimizar consultas a base de datos', status: 'En progreso', priority: 'Baja', dueDate: '2025-05-15', listName: 'Optimización' },
  { id: 5, title: 'Reunión con cliente para revisión', status: 'Pendiente', priority: 'Alta', dueDate: '2025-05-05', listName: 'Reuniones' },
];

const userData = [
  { id: 1, name: 'Juan Pérez', email: 'juan@ejemplo.com', totalTasks: 12, completedTasks: 5, lists: ['Diseño Web', 'Reuniones'] },
  { id: 2, name: 'Ana López', email: 'ana@ejemplo.com', totalTasks: 8, completedTasks: 6, lists: ['Desarrollo Backend', 'Bugs'] },
  { id: 3, name: 'Carlos Rodríguez', email: 'carlos@ejemplo.com', totalTasks: 15, completedTasks: 10, lists: ['Diseño Web', 'Optimización'] },
];

const listData = [
  { id: 1, name: 'Diseño Web', taskCount: 4, completedTasks: 1 },
  { id: 2, name: 'Desarrollo Backend', taskCount: 3, completedTasks: 0 },
  { id: 3, name: 'Bugs', taskCount: 5, completedTasks: 2 },
  { id: 4, name: 'Optimización', taskCount: 2, completedTasks: 1 },
  { id: 5, name: 'Reuniones', taskCount: 3, completedTasks: 3 },
];

const statusData = [
  { name: 'Pendiente', value: 2, color: '#FFC107' },
  { name: 'En progreso', value: 2, color: '#0D6EFD' },
  { name: 'Completado', value: 1, color: '#198754' },
];

const listChartData = listData.map(list => ({
  name: list.name,
  total: list.taskCount,
  completed: list.completedTasks
}));

const AdminPanel = () => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  
  const filteredTasks = taskData.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Funciones para abrir/cerrar modales
  const handleCloseTaskModal = () => setShowTaskModal(false);
  const handleShowTaskModal = () => setShowTaskModal(true);
  const handleCloseUserModal = () => setShowUserModal(false);
  const handleShowUserModal = () => setShowUserModal(true);
  const handleCloseListModal = () => setShowListModal(false);
  const handleShowListModal = () => setShowListModal(true);

  // Componente de estadísticas
  const StatsCards = () => (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="h-100">
          <Card.Body className="d-flex align-items-center">
            <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
              <div className="text-primary fw-bold fs-4">{taskData.length}</div>
            </div>
            <div>
              <div className="text-muted small">Total de Tareas</div>
              <div className="fw-bold">{taskData.length}</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100">
          <Card.Body className="d-flex align-items-center">
            <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
              <div className="text-warning fw-bold fs-4">
                {taskData.filter(task => task.status === 'Pendiente').length}
              </div>
            </div>
            <div>
              <div className="text-muted small">Pendientes</div>
              <div className="fw-bold">
                {taskData.filter(task => task.status === 'Pendiente').length}
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100">
          <Card.Body className="d-flex align-items-center">
            <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
              <div className="text-info fw-bold fs-4">
                {taskData.filter(task => task.status === 'En progreso').length}
              </div>
            </div>
            <div>
              <div className="text-muted small">En Progreso</div>
              <div className="fw-bold">
                {taskData.filter(task => task.status === 'En progreso').length}
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100">
          <Card.Body className="d-flex align-items-center">
            <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
              <div className="text-success fw-bold fs-4">
                {taskData.filter(task => task.status === 'Completado').length}
              </div>
            </div>
            <div>
              <div className="text-muted small">Completadas</div>
              <div className="fw-bold">
                {taskData.filter(task => task.status === 'Completado').length}
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  // Página de Dashboard
  const DashboardTab = () => (
    <>
      <StatsCards />
      
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>Estado de Tareas</Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>Tareas por Lista</Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={listChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="Total" fill="#0D6EFD" />
                    <Bar dataKey="completed" name="Completadas" fill="#198754" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Card.Header>Tareas Recientes</Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Lista</th>
                <th>Fecha Límite</th>
              </tr>
            </thead>
            <tbody>
              {taskData.slice(0, 5).map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>
                    <Badge bg={
                      task.status === 'Completado' ? 'success' : 
                      task.status === 'En progreso' ? 'primary' : 'warning'
                    }>
                      {task.status}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={
                      task.priority === 'Alta' ? 'danger' : 
                      task.priority === 'Media' ? 'warning' : 'success'
                    }>
                      {task.priority}
                    </Badge>
                  </td>
                  <td>{task.listName}</td>
                  <td>{task.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );

  // Página de Tareas
  const TasksTab = () => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Administración de Tareas</h2>
        <Button variant="primary" onClick={handleShowTaskModal}>
          <Plus size={18} className="me-2" />
          Nueva Tarea
        </Button>
      </div>
      
      <Card>
        <Card.Body>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En progreso">En progreso</option>
                <option value="Completado">Completado</option>
              </Form.Select>
            </Col>
            <Col md={9}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
          
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Lista</th>
                <th>Fecha Límite</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.title}</td>
                  <td>
                    <Badge bg={
                      task.status === 'Completado' ? 'success' : 
                      task.status === 'En progreso' ? 'primary' : 'warning'
                    }>
                      {task.status}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={
                      task.priority === 'Alta' ? 'danger' : 
                      task.priority === 'Media' ? 'warning' : 'success'
                    }>
                      {task.priority}
                    </Badge>
                  </td>
                  <td>{task.listName}</td>
                  <td>{task.dueDate}</td>
                  <td>
                    <Button variant="link" className="p-0 me-2">
                      <Pencil size={18} />
                    </Button>
                    <Button variant="link" className="p-0 text-danger">
                      <Trash size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Modal para nueva tarea */}
      <Modal show={showTaskModal} onHide={handleCloseTaskModal}>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control type="text" placeholder="Título de la tarea" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Descripción detallada de la tarea" />
            </Form.Group>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En progreso">En progreso</option>
                    <option value="Completado">Completado</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Prioridad</Form.Label>
                  <Form.Select>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Lista</Form.Label>
                  <Form.Select>
                    <option value="">Seleccionar lista</option>
                    {listData.map(list => (
                      <option key={list.id} value={list.name}>{list.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Fecha límite</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Label>Asignar a</Form.Label>
              <Form.Select>
                <option value="">Seleccionar usuario</option>
                {userData.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTaskModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCloseTaskModal}>
            Guardar Tarea
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );

  // Página de Usuarios
  const UsersTab = () => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Administración de Usuarios</h2>
        <Button variant="primary" onClick={handleShowUserModal}>
          <Plus size={18} className="me-2" />
          Nuevo Usuario
        </Button>
      </div>
      
      <Row className="mb-4">
        {userData.map(user => (
          <Col md={4} key={user.id} className="mb-3">
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                       style={{ width: '50px', height: '50px', fontSize: '20px' }}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="mb-0">{user.name}</h5>
                    <small className="text-muted">{user.email}</small>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Progreso de tareas</small>
                    <small>{Math.round((user.completedTasks / user.totalTasks) * 100)}%</small>
                  </div>
                  <ProgressBar now={Math.round((user.completedTasks / user.totalTasks) * 100)} />
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <div>Tareas totales: {user.totalTasks}</div>
                  <div>Completadas: {user.completedTasks}</div>
                </div>
                <div className="mt-3">
                  <small className="text-muted">Listas:</small>
                  <div>
                    {user.lists.map((list, index) => (
                      <Badge bg="light" text="dark" className="me-1" key={index}>
                        {list}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-end bg-white border-top-0">
                <Button variant="link" className="p-0 me-2" size="sm">
                  <Pencil size={16} />
                </Button>
                <Button variant="link" className="p-0 text-danger" size="sm">
                  <Trash size={16} />
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Modal para nuevo usuario */}
      <Modal show={showUserModal} onHide={handleCloseUserModal}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" placeholder="Nombre completo" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="email@ejemplo.com" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" placeholder="Contraseña" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Asignar a listas</Form.Label>
              <div>
                {listData.map(list => (
                  <Form.Check 
                    key={list.id}
                    type="checkbox"
                    id={`list-${list.id}`}
                    label={list.name}
                  />
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUserModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCloseUserModal}>
            Guardar Usuario
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );

  // Página de Listas
  const ListsTab = () => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Administración de Listas</h2>
        <Button variant="primary" onClick={handleShowListModal}>
          <Plus size={18} className="me-2" />
          Nueva Lista
        </Button>
      </div>
      
      <Table hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Tareas Totales</th>
            <th>Completadas</th>
            <th>Progreso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {listData.map(list => (
            <tr key={list.id}>
              <td>{list.id}</td>
              <td>{list.name}</td>
              <td>{list.taskCount}</td>
              <td>{list.completedTasks}</td>
              <td style={{ width: '25%' }}>
                <ProgressBar 
                  now={Math.round((list.completedTasks / list.taskCount) * 100)} 
                  label={`${Math.round((list.completedTasks / list.taskCount) * 100)}%`}
                />
              </td>
              <td>
                <Button variant="link" className="p-0 me-2">
                  <Pencil size={18} />
                </Button>
                <Button variant="link" className="p-0 text-danger">
                  <Trash size={18} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {/* Modal para nueva lista */}
      <Modal show={showListModal} onHide={handleCloseListModal}>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Lista</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" placeholder="Nombre de la lista" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Descripción de la lista" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <Form.Control type="color" defaultValue="#0D6EFD" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Asignar a usuarios</Form.Label>
              <div>
                {userData.map(user => (
                  <Form.Check 
                    key={user.id}
                    type="checkbox"
                    id={`user-${user.id}`}
                    label={user.name}
                  />
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseListModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCloseListModal}>
            Guardar Lista
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );

  return (
    <Container fluid className="py-4">
      <Tabs
        defaultActiveKey="dashboard"
        id="dashboard-tabs"
        className="mb-4"
      >
        <Tab eventKey="dashboard" title="Dashboard">
          <DashboardTab />
        </Tab>
        <Tab eventKey="tasks" title="Tareas">
          <TasksTab />
        </Tab>
        <Tab eventKey="users" title="Usuarios">
          <UsersTab />
        </Tab>
        <Tab eventKey="lists" title="Listas">
          <ListsTab />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminPanel;