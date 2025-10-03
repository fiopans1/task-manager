import listService from '../listService';
import axios from 'axios';
import store from '../../redux/store';

// Mock axios
jest.mock('axios');

// Mock store
jest.mock('../../redux/store', () => ({
  getState: jest.fn(),
}));

describe('listService', () => {
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
  });

  describe('createList', () => {
    it('should successfully create a new list', async () => {
      // Arrange
      const newList = {
        nameOfList: 'Shopping List',
        descriptionOfList: 'Grocery shopping',
        color: '#FF0000',
      };
      
      const mockResponse = {
        data: {
          id: 1,
          ...newList,
          listElements: [],
        },
      };
      
      axios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await listService.createList(newList);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/lists/create',
        newList,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when list creation fails', async () => {
      // Arrange
      const newList = {
        nameOfList: 'Test List',
        descriptionOfList: 'Test Description',
      };
      
      axios.post.mockRejectedValue(new Error('Server error'));

      // Act & Assert
      await expect(listService.createList(newList)).rejects.toThrow(
        'Error al conectar con el servidor'
      );
    });
  });

  describe('editList', () => {
    it('should successfully update a list', async () => {
      // Arrange
      const listToUpdate = {
        id: 1,
        nameOfList: 'Updated List',
        descriptionOfList: 'Updated Description',
        color: '#00FF00',
      };
      
      const mockResponse = {
        data: listToUpdate,
      };
      
      axios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await listService.editList(listToUpdate);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/lists/update/1',
        listToUpdate,
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

  describe('deleteList', () => {
    it('should successfully delete a list', async () => {
      // Arrange
      const listId = 1;
      const mockResponse = {
        data: { message: 'List deleted successfully' },
      };
      
      axios.delete.mockResolvedValue(mockResponse);

      // Act
      const result = await listService.deleteList(listId);

      // Assert
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/api/lists/delete/1',
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

  describe('getLists', () => {
    it('should successfully fetch all lists', async () => {
      // Arrange
      const mockLists = [
        {
          id: 1,
          nameOfList: 'List 1',
          descriptionOfList: 'Description 1',
          color: '#FF0000',
          listElements: [],
        },
        {
          id: 2,
          nameOfList: 'List 2',
          descriptionOfList: 'Description 2',
          color: '#00FF00',
          listElements: [],
        },
      ];
      
      const mockResponse = {
        data: mockLists,
      };
      
      axios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await listService.getLists();

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/lists/get',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockLists);
    });
  });

  describe('getElementsList', () => {
    it('should successfully fetch a list with its elements', async () => {
      // Arrange
      const listId = 1;
      const mockList = {
        id: listId,
        nameOfList: 'Shopping List',
        descriptionOfList: 'Grocery shopping',
        color: '#FF0000',
        listElements: [
          {
            id: 1,
            name: 'Milk',
            description: '2 liters',
            completed: false,
          },
          {
            id: 2,
            name: 'Bread',
            description: 'Whole wheat',
            completed: true,
          },
        ],
      };
      
      const mockResponse = {
        data: mockList,
      };
      
      axios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await listService.getElementsList(listId);

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/lists/1',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockList);
    });
  });

  describe('createElementList', () => {
    it('should successfully create a list element', async () => {
      // Arrange
      const listId = 1;
      const newElement = {
        name: 'Eggs',
        description: 'One dozen',
        completed: false,
      };
      
      const mockResponse = {
        data: {
          id: 3,
          ...newElement,
        },
      };
      
      axios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await listService.createElementList(listId, newElement);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/lists/1/elements',
        newElement,
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

  describe('updateElementList', () => {
    it('should successfully update a list element', async () => {
      // Arrange
      const elementId = 1;
      const updatedElement = {
        id: elementId,
        name: 'Updated Milk',
        description: '3 liters',
        completed: true,
      };
      
      const mockResponse = {
        data: updatedElement,
      };
      
      axios.put.mockResolvedValue(mockResponse);

      // Act
      const result = await listService.updateElementList(elementId, updatedElement);

      // Assert
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8080/api/lists/elements/1',
        updatedElement,
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

  describe('deleteElementList', () => {
    it('should successfully delete a list element', async () => {
      // Arrange
      const listId = 1;
      const elementId = 2;
      const mockResponse = {
        data: { message: 'Element deleted successfully' },
      };
      
      axios.delete.mockResolvedValue(mockResponse);

      // Act
      const result = await listService.deleteElementList(listId, elementId);

      // Assert
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/api/lists/1/elements/2',
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

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange
      axios.get.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(listService.getLists()).rejects.toThrow();
    });

    it('should handle server errors with proper error messages', async () => {
      // Arrange
      const errorMessage = 'Internal server error';
      axios.post.mockRejectedValue({
        response: {
          data: { error: errorMessage },
        },
      });

      // Act & Assert
      await expect(
        listService.createList({ nameOfList: 'Test' })
      ).rejects.toThrow();
    });
  });
});
