import taskService from '../taskService';
import axios from 'axios';
import store from '../../redux/store';

// Mock axios
jest.mock('axios');

// Mock store
jest.mock('../../redux/store', () => ({
  getState: jest.fn(),
}));

describe('taskService', () => {
  const mockToken = 'test-jwt-token';
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_BACKEND_URL = 'http://localhost:8080';
    
    // Mock store.getState to return token
    store.getState.mockReturnValue({
      auth: {
        token: mockToken,
      },
    });

    // Clear cache before each test
    taskService.invalidateTasksCache();
  });

  describe('createTask', () => {
    it('should successfully create a new task', async () => {
      // Arrange
      const newTask = {
        nameOfTask: 'Test Task',
        descriptionOfTask: 'Test Description',
        state: 'NEW',
        priority: 'MEDIUM',
      };
      
      const mockResponse = {
        data: {
          id: 1,
          ...newTask,
        },
      };
      
      axios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await taskService.createTask(newTask);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/create',
        newTask,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when task creation fails', async () => {
      // Arrange
      const newTask = {
        nameOfTask: 'Test Task',
        descriptionOfTask: 'Test Description',
      };
      
      axios.post.mockRejectedValue(new Error('Server error'));

      // Act & Assert
      await expect(taskService.createTask(newTask)).rejects.toThrow(
        'Error al conectar con el servidor'
      );
    });
  });

  describe('editTask', () => {
    it('should successfully update a task', async () => {
      // Arrange
      const taskToUpdate = {
        id: 1,
        nameOfTask: 'Updated Task',
        descriptionOfTask: 'Updated Description',
        state: 'IN_PROGRESS',
        priority: 'HIGH',
      };
      
      const mockResponse = {
        data: taskToUpdate,
      };
      
      axios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await taskService.editTask(taskToUpdate);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/update/1',
        taskToUpdate,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteTask', () => {
    it('should successfully delete a task', async () => {
      // Arrange
      const taskId = 1;
      const mockResponse = {
        data: { message: 'Task deleted successfully' },
      };
      
      axios.delete.mockResolvedValue(mockResponse);

      // Act
      const result = await taskService.deleteTask(taskId);

      // Assert
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/delete/1',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getTaskById', () => {
    it('should successfully fetch a task by id', async () => {
      // Arrange
      const taskId = 1;
      const mockTask = {
        id: taskId,
        nameOfTask: 'Test Task',
        descriptionOfTask: 'Test Description',
        state: 'NEW',
        priority: 'MEDIUM',
      };
      
      const mockResponse = {
        data: mockTask,
      };
      
      axios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await taskService.getTaskById(taskId);

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/1',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('createActionTask', () => {
    it('should successfully create an action for a task', async () => {
      // Arrange
      const taskId = 1;
      const action = {
        actionName: 'Test Action',
        actionDescription: 'Test Action Description',
        actionType: 'COMMENT',
      };
      
      const mockResponse = {
        data: {
          id: 1,
          ...action,
        },
      };
      
      axios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await taskService.createActionTask(taskId, action);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/1/actions',
        action,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteActionTask', () => {
    it('should successfully delete an action from a task', async () => {
      // Arrange
      const taskId = 1;
      const actionId = 2;
      const mockResponse = {
        data: { message: 'Action deleted successfully' },
      };
      
      axios.delete.mockResolvedValue(mockResponse);

      // Act
      const result = await taskService.deleteActionTask(taskId, actionId);

      // Assert
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/1/actions/2',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getActionsTask', () => {
    it('should successfully fetch actions for a task', async () => {
      // Arrange
      const taskId = 1;
      const mockActions = [
        {
          id: 1,
          actionName: 'Action 1',
          actionDescription: 'Description 1',
          actionType: 'COMMENT',
        },
        {
          id: 2,
          actionName: 'Action 2',
          actionDescription: 'Description 2',
          actionType: 'UPDATE',
        },
      ];
      
      const mockResponse = {
        data: mockActions,
      };
      
      axios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await taskService.getActionsTask(taskId);

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/1/actions',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockActions);
    });
  });

  describe('getEvents', () => {
    it('should successfully fetch events', async () => {
      // Arrange
      const mockEvents = [
        {
          id: 1,
          title: 'Event 1',
          start: new Date(),
          end: new Date(),
        },
      ];
      
      const mockResponse = {
        data: mockEvents,
      };
      
      axios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await taskService.getEvents();

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks/events/get',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getTasks with caching', () => {
    it('should fetch and cache tasks', async () => {
      // Arrange
      const mockTasks = [
        { id: 1, nameOfTask: 'Task 1' },
        { id: 2, nameOfTask: 'Task 2' },
      ];
      
      const mockResponse = {
        data: mockTasks,
      };
      
      axios.get.mockResolvedValue(mockResponse);

      // Act
      const resource1 = taskService.getTasks();
      
      // Simulate suspend/resume by reading the resource
      await new Promise(resolve => setTimeout(resolve, 10));

      // Assert
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should use cached tasks on subsequent calls', async () => {
      // Arrange
      const mockTasks = [
        { id: 1, nameOfTask: 'Task 1' },
      ];
      
      const mockResponse = {
        data: mockTasks,
      };
      
      axios.get.mockResolvedValue(mockResponse);

      // Act
      taskService.getTasks();
      await new Promise(resolve => setTimeout(resolve, 10));
      
      taskService.getTasks(); // Second call should use cache

      // Assert
      expect(axios.get).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should invalidate cache when requested', async () => {
      // Arrange
      const mockTasks = [
        { id: 1, nameOfTask: 'Task 1' },
      ];
      
      const mockResponse = {
        data: mockTasks,
      };
      
      axios.get.mockResolvedValue(mockResponse);

      // Act
      taskService.getTasks();
      await new Promise(resolve => setTimeout(resolve, 10));
      
      taskService.invalidateTasksCache();
      
      taskService.getTasks(); // Should fetch again

      // Assert
      expect(axios.get).toHaveBeenCalledTimes(2); // Called twice
    });
  });
});
