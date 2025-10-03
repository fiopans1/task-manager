import authService from '../authService';
import axios from 'axios';
import store from '../../redux/store';
import { setToken, clearToken } from '../../redux/slices/authSlice';

// Mock axios
jest.mock('axios');

// Mock store
jest.mock('../../redux/store', () => ({
  getState: jest.fn(),
  dispatch: jest.fn(),
}));

// Mock redux actions
jest.mock('../../redux/slices/authSlice', () => ({
  setToken: jest.fn(),
  clearToken: jest.fn(),
}));

describe('authService', () => {
  const mockToken = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxNzEyNTI2MDAwLCJyb2xlcyI6IlVTRVIifQ.test';
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_BACKEND_URL = 'http://localhost:8080';
    
    // Mock store.getState
    store.getState.mockReturnValue({
      auth: {
        token: null,
      },
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'password123';
      const mockResponse = {
        data: { token: mockToken },
      };
      
      axios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authService.login(username, password);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/auth/login',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(setToken).toHaveBeenCalledWith(mockToken);
      expect(result).toBe(mockToken);
    });

    it('should throw error when login fails with server error', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'wrongpassword';
      const errorMessage = 'Invalid credentials';
      
      axios.post.mockRejectedValue({
        response: {
          data: { error: errorMessage },
        },
      });

      // Act & Assert
      await expect(authService.login(username, password)).rejects.toThrow(errorMessage);
    });

    it('should throw generic error when no response from server', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'password123';
      
      axios.post.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(authService.login(username, password)).rejects.toThrow(
        'Error al conectar con el servidor'
      );
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const formData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        age: 25,
        name: 'John',
        surname1: 'Doe',
        surname2: 'Smith',
      };
      
      const mockResponse = {
        data: { success: true },
      };
      
      axios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authService.register(formData);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/auth/register',
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          age: formData.age,
          name: {
            name: formData.name,
            surname1: formData.surname1,
            surname2: formData.surname2,
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error with validation messages when registration fails', async () => {
      // Arrange
      const formData = {
        username: '',
        email: 'invalid-email',
        password: '123',
        age: 17,
        name: '',
        surname1: '',
        surname2: '',
      };
      
      const errorMessages = ['Username is required', 'Invalid email format'];
      
      axios.post.mockRejectedValue({
        response: {
          data: {
            errorCount: 2,
            errorMessages,
          },
        },
      });

      // Act & Assert
      await expect(authService.register(formData)).rejects.toThrow(
        errorMessages.join(', ')
      );
    });
  });

  describe('getToken', () => {
    it('should return token from store', () => {
      // Arrange
      const testToken = 'test-token-123';
      store.getState.mockReturnValue({
        auth: {
          token: testToken,
        },
      });

      // Act
      const result = authService.getToken();

      // Assert
      expect(result).toBe(testToken);
    });
  });

  describe('getUsername', () => {
    it('should extract username from valid token', () => {
      // Arrange
      store.getState.mockReturnValue({
        auth: {
          token: mockToken,
        },
      });

      // Act
      const result = authService.getUsername();

      // Assert
      expect(result).toBe('testuser');
    });

    it('should return undefined when token is null', () => {
      // Arrange
      store.getState.mockReturnValue({
        auth: {
          token: null,
        },
      });

      // Act
      const result = authService.getUsername();

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('getRoles', () => {
    it('should extract roles from valid token', () => {
      // Arrange
      store.getState.mockReturnValue({
        auth: {
          token: mockToken,
        },
      });

      // Act
      const result = authService.getRoles();

      // Assert
      expect(result).toEqual(['USER']);
    });
  });

  describe('isTokenValid', () => {
    it('should return true for valid non-expired token', () => {
      // Arrange
      store.getState.mockReturnValue({
        auth: {
          token: mockToken,
        },
      });

      // Act
      const result = authService.isTokenValid();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no token exists', () => {
      // Arrange
      store.getState.mockReturnValue({
        auth: {
          token: null,
        },
      });

      // Act
      const result = authService.isTokenValid();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for expired token', () => {
      // Arrange
      const expiredToken = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6MTAwMDAwMDAwMCwiaWF0IjoxNzEyNTI2MDAwLCJyb2xlcyI6IlVTRVIifQ.test';
      store.getState.mockReturnValue({
        auth: {
          token: expiredToken,
        },
      });

      // Act
      const result = authService.isTokenValid();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear token from store', () => {
      // Act
      authService.logout();

      // Assert
      expect(clearToken).toHaveBeenCalled();
    });
  });

  describe('OAuth2', () => {
    const originalWindow = global.window;

    beforeEach(() => {
      delete global.window;
      global.window = { location: { href: '' } };
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it('should redirect to OAuth2 provider login', () => {
      // Act
      authService.loginWithOAuth2('github');

      // Assert
      expect(global.window.location.href).toBe(
        'http://localhost:8080/oauth2/authorization/github'
      );
    });

    it('should check for OAuth2 token in URL', () => {
      // Arrange
      delete global.window.location;
      global.window.location = { 
        href: 'http://localhost:3000?token=' + mockToken,
        replace: jest.fn()
      };

      // Act
      const result = authService.checkForOAuth2Token();

      // Assert
      expect(result).toBe(mockToken);
      expect(setToken).toHaveBeenCalledWith(mockToken);
      expect(global.window.location.replace).toHaveBeenCalledWith('http://localhost:3000');
    });

    it('should return null when no OAuth2 token in URL', () => {
      // Arrange
      delete global.window.location;
      global.window.location = { 
        href: 'http://localhost:3000',
        replace: jest.fn()
      };

      // Act
      const result = authService.checkForOAuth2Token();

      // Assert
      expect(result).toBeNull();
    });
  });
});
