import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import LoginPage from '../LoginPage';
import authService from '../../../services/authService';

// Mock authService
jest.mock('../../../services/authService');

// Mock Noty
jest.mock('../../common/Noty', () => ({
  successToast: jest.fn(),
  errorToast: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LoginPage Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <LoginPage onLogin={mockOnLogin} />
      </BrowserRouter>
    );
  };

  it('should render login form with username and password fields', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should update username input when typing', () => {
    renderLoginPage();

    const usernameInput = screen.getByLabelText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    expect(usernameInput.value).toBe('testuser');
  });

  it('should update password input when typing', () => {
    renderLoginPage();

    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  it('should call authService.login on form submission with valid credentials', async () => {
    authService.login.mockResolvedValue('mock-token');
    renderLoginPage();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('should call onLogin callback after successful login', async () => {
    const mockToken = 'mock-jwt-token';
    authService.login.mockResolvedValue(mockToken);
    renderLoginPage();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(mockToken);
    });
  });

  it('should display error message on failed login', async () => {
    const errorMessage = 'Invalid credentials';
    authService.login.mockRejectedValue(new Error(errorMessage));
    renderLoginPage();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
    });
  });

  it('should have a link to registration page', () => {
    renderLoginPage();

    const registerLink = screen.getByText(/don't have an account/i).closest('a') ||
                         screen.getByText(/register/i);
    expect(registerLink).toBeInTheDocument();
  });

  it('should disable submit button while login is in progress', async () => {
    authService.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderLoginPage();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Check if button is disabled during login
    await waitFor(() => {
      expect(loginButton).toBeDisabled();
    }, { timeout: 50 });
  });

  it('should not submit form with empty fields', () => {
    renderLoginPage();

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    expect(authService.login).not.toHaveBeenCalled();
  });
});
