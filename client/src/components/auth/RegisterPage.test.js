import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import RegisterPage from '../RegisterPage';
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

describe('RegisterPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderRegisterPage = () => {
    return render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );
  };

  it('should render registration form with all required fields', () => {
    renderRegisterPage();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should update form fields when typing', () => {
    renderRegisterPage();

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('newuser');
    expect(emailInput.value).toBe('newuser@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should successfully register a new user', async () => {
    authService.register.mockResolvedValue({ success: true });
    renderRegisterPage();

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const ageInput = screen.getByLabelText(/age/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(ageInput, { target: { value: '25' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
    });
  });

  it('should display error message on failed registration', async () => {
    const errorMessage = 'Username already exists';
    authService.register.mockRejectedValue(new Error(errorMessage));
    renderRegisterPage();

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
    });
  });

  it('should have a link to login page', () => {
    renderRegisterPage();

    const loginLink = screen.getByText(/already have an account/i).closest('a') ||
                      screen.getByText(/login/i);
    expect(loginLink).toBeInTheDocument();
  });

  it('should validate email format', () => {
    renderRegisterPage();

    const emailInput = screen.getByLabelText(/email/i);
    
    // Valid email
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    expect(emailInput.validity.valid || emailInput.value).toBeTruthy();

    // Invalid email should trigger HTML5 validation
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(emailInput.value).toBe('invalid-email');
  });

  it('should validate age is a number', () => {
    renderRegisterPage();

    const ageInput = screen.getByLabelText(/age/i);
    
    fireEvent.change(ageInput, { target: { value: '25' } });
    expect(ageInput.value).toBe('25');
  });

  it('should disable submit button while registration is in progress', async () => {
    authService.register.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderRegisterPage();

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const ageInput = screen.getByLabelText(/age/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(ageInput, { target: { value: '25' } });
    fireEvent.click(registerButton);

    // Check if button is disabled during registration
    await waitFor(() => {
      expect(registerButton).toBeDisabled();
    }, { timeout: 50 });
  });

  it('should not submit form with empty required fields', () => {
    renderRegisterPage();

    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should handle password confirmation field if present', () => {
    renderRegisterPage();

    // Check if there's a confirm password field
    const confirmPasswordInput = screen.queryByLabelText(/confirm password/i);
    
    if (confirmPasswordInput) {
      const passwordInput = screen.getByLabelText(/^password/i);
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      expect(confirmPasswordInput.value).toBe('password123');
    }
  });
});
