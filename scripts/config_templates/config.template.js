/**
 * Task Manager Frontend Configuration
 * 
 * This file contains all configuration settings for the frontend application.
 * Update these values according to your deployment environment.
 * 
 * NOTE: This file is loaded at runtime from the public directory.
 * Any changes require rebuilding or redeploying the application.
 */

window.APP_CONFIG = {
  /**
   * Backend API Configuration
   */
  api: {
    // Base URL for the backend API
    // Examples:
    // - Development: 'http://localhost:8080'
    // - Production: 'https://api.yourdomain.com'
    baseUrl: 'http://localhost:8080'
  },

  /**
   * OAuth2 Configuration
   * Configure OAuth2 providers for authentication
   */
  oauth2: {
    // Enable/disable OAuth2 authentication globally
    enabled: false,

    // Google OAuth2 Provider
    google: {
      enabled: false
    },

    // GitHub OAuth2 Provider
    github: {
      enabled: false
    },

    // Authentik OAuth2 Provider
    authentik: {
      enabled: false
    }
  },

  /**
   * Application Settings
   */
  app: {
    // Application name displayed in the UI
    name: 'Task Manager',
    
    // Application version
    version: '1.0.0',
    
    // Enable debug mode (shows additional logging)
    debug: false
  },

  /**
   * Feature Flags
   * Enable or disable specific features
   */
  features: {
    // Enable calendar integration
    calendar: true,
    
    // Enable task lists
    lists: true,
    
    // Enable task time tracking
    timeTracking: true
  }
};
