/**
 * Configuration Service
 * 
 * Provides access to application configuration loaded from config.js
 * This service acts as a centralized point for all configuration access
 * throughout the application.
 */

class ConfigService {
  constructor() {
    this.config = null;
  }

  /**
   * Initialize configuration
   * Loads config from window.APP_CONFIG or falls back to defaults
   */
  init() {
    this.config = window.APP_CONFIG || this.getDefaultConfig();
  }

  /**
   * Get default configuration
   * Used as fallback if config.js is not loaded
   */
  getDefaultConfig() {
    return {
      api: {
        baseUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'
      },
      oauth2: {
        enabled: process.env.REACT_APP_OAUTH2_ENABLED === 'true' || false,
        google: {
          enabled: process.env.REACT_APP_OAUTH2_GOOGLE_ENABLED === 'true' || false
        },
        github: {
          enabled: process.env.REACT_APP_OAUTH2_GITHUB_ENABLED === 'true' || false
        },
        authentik: {
          enabled: process.env.REACT_APP_OAUTH2_AUTHENTIK_ENABLED === 'true' || false
        }
      },
      app: {
        name: 'Task Manager',
        version: '1.0.0',
        debug: false
      },
      features: {
        calendar: true,
        lists: true,
        timeTracking: true
      }
    };
  }

  /**
   * Get API base URL
   */
  getApiBaseUrl() {
    if (!this.config) this.init();
    return this.config.api.baseUrl;
  }

  /**
   * Check if OAuth2 is enabled globally
   */
  isOAuth2Enabled() {
    if (!this.config) this.init();
    return this.config.oauth2.enabled;
  }

  /**
   * Check if a specific OAuth2 provider is enabled
   */
  isOAuth2ProviderEnabled(provider) {
    if (!this.config) this.init();
    const providerConfig = this.config.oauth2[provider];
    return providerConfig && providerConfig.enabled;
  }

  /**
   * Get application name
   */
  getAppName() {
    if (!this.config) this.init();
    return this.config.app.name;
  }

  /**
   * Get application version
   */
  getAppVersion() {
    if (!this.config) this.init();
    return this.config.app.version;
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugMode() {
    if (!this.config) this.init();
    return this.config.app.debug;
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature) {
    if (!this.config) this.init();
    return this.config.features[feature] !== false;
  }

  /**
   * Get the full configuration object
   */
  getConfig() {
    if (!this.config) this.init();
    return this.config;
  }
}

// Export singleton instance
const configService = new ConfigService();
export default configService;
