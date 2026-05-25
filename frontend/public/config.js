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
    // Dev: empty string = same-origin via Vite proxy to localhost:8080
    // Prod: set the actual backend URL
    baseUrl: ''
  },

  /**
   * OAuth2 Configuration
   * Configure OAuth2 providers for authentication
   */
  oauth2: {
    // Enable/disable OAuth2 authentication globally
    enabled: true,

    // Google OAuth2 Provider
    google: {
      enabled: true
    },

    // GitHub OAuth2 Provider
    github: {
      enabled: true
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
    version: '0.0.1',

    // Enable debug mode (shows additional logging)
    debug: false,

    license: 'Community Edition'
  },

  /**
   * Session behavior
   */
  session: {
    // Minutes of user inactivity before showing the idle session modal
    inactivityThresholdMinutes: 10
  },

  /**
   * Feature Flags
   * Enable or disable specific features
   */
  // features: {
  //   // Enable calendar integration
  //   calendar: true,

  //   // Enable task lists
  //   lists: true,

  //   // Enable task time tracking
  //   timeTracking: true
  // }
};
