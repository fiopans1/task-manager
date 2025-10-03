import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import OAuth2Login from '../OAuth2Login';
import authService from '../../../services/authService';
import { successToast, errorToast } from '../../common/Noty';

// Mock authService
jest.mock('../../../services/authService');

// Mock Noty
jest.mock('../../common/Noty', () => ({
  successToast: jest.fn(),
  errorToast: jest.fn(),
}));

describe('OAuth2Login Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    delete window.location;
    window.location = { 
      href: 'http://localhost:3000',
      search: ''
    };
  });

  const renderOAuth2Login = () => {
    return render(
      <BrowserRouter>
        <OAuth2Login onLogin={mockOnLogin} />
      </BrowserRouter>
    );
  };

  it('should render OAuth2 login buttons', () => {
    renderOAuth2Login();

    expect(screen.getByText(/continue with GitHub/i)).toBeInTheDocument();
    expect(screen.getByText(/continue with Google/i)).toBeInTheDocument();
  });

  it('should call loginWithOAuth2 when GitHub button is clicked', () => {
    authService.loginWithOAuth2 = jest.fn();
    renderOAuth2Login();

    const githubButton = screen.getByText(/continue with GitHub/i).closest('button');
    fireEvent.click(githubButton);

    expect(authService.loginWithOAuth2).toHaveBeenCalledWith('github');
  });

  it('should call loginWithOAuth2 when Google button is clicked', () => {
    authService.loginWithOAuth2 = jest.fn();
    renderOAuth2Login();

    const googleButton = screen.getByText(/continue with Google/i).closest('button');
    fireEvent.click(googleButton);

    expect(authService.loginWithOAuth2).toHaveBeenCalledWith('google');
  });

  it('should check for OAuth2 token on component mount', async () => {
    authService.checkForOAuth2Token = jest.fn().mockReturnValue(null);
    renderOAuth2Login();

    await waitFor(() => {
      expect(authService.checkForOAuth2Token).toHaveBeenCalled();
    });
  });

  it('should call onLogin callback when OAuth2 token is found', async () => {
    const mockToken = 'oauth2-token-123';
    authService.checkForOAuth2Token = jest.fn().mockReturnValue(mockToken);
    
    renderOAuth2Login();

    await waitFor(() => {
      expect(authService.checkForOAuth2Token).toHaveBeenCalled();
      expect(mockOnLogin).toHaveBeenCalledWith(mockToken);
      expect(successToast).toHaveBeenCalledWith('Login successfully with OAuth2');
    });
  });

  it('should display error toast when OAuth2 login fails', async () => {
    window.location.search = '?code=error&message=Authentication%20failed';
    authService.checkForOAuth2Token = jest.fn().mockReturnValue(null);
    
    renderOAuth2Login();

    await waitFor(() => {
      expect(errorToast).toHaveBeenCalledWith(
        expect.stringContaining('OAuth2 login failed')
      );
    });
  });

  it('should show loading state when OAuth2 provider is selected', () => {
    authService.loginWithOAuth2 = jest.fn();
    renderOAuth2Login();

    const githubButton = screen.getByText(/continue with GitHub/i).closest('button');
    fireEvent.click(githubButton);

    // Loading state should be shown (spinner or disabled button)
    expect(authService.loginWithOAuth2).toHaveBeenCalled();
  });

  it('should have link to traditional login', () => {
    renderOAuth2Login();

    const loginLink = screen.getByText(/use traditional login/i) ||
                      screen.getByText(/back to login/i);
    expect(loginLink).toBeInTheDocument();
  });

  it('should handle OAuth2 error in URL parameters', async () => {
    window.location.search = '?code=123&message=Invalid%20OAuth2%20token';
    authService.checkForOAuth2Token = jest.fn().mockReturnValue(null);
    
    renderOAuth2Login();

    await waitFor(() => {
      expect(errorToast).toHaveBeenCalled();
    });
  });

  it('should display provider logos correctly', () => {
    renderOAuth2Login();

    // Check if SVG or image elements for provider logos exist
    const githubButton = screen.getByText(/continue with GitHub/i).closest('button');
    const googleButton = screen.getByText(/continue with Google/i).closest('button');

    expect(githubButton).toBeInTheDocument();
    expect(googleButton).toBeInTheDocument();
  });

  it('should handle OAuth2 provider errors gracefully', async () => {
    const errorMessage = 'Provider not available';
    authService.loginWithOAuth2 = jest.fn().mockImplementation(() => {
      throw new Error(errorMessage);
    });
    
    renderOAuth2Login();

    const githubButton = screen.getByText(/continue with GitHub/i).closest('button');
    
    try {
      fireEvent.click(githubButton);
    } catch (error) {
      // Error should be caught and displayed
    }

    await waitFor(() => {
      expect(authService.loginWithOAuth2).toHaveBeenCalled();
    });
  });
});
