/**
 * Configuration Service
 * Loads runtime configuration from config.json with cache-busting mechanism
 */

let config = null;
let configPromise = null;

/**
 * Resets the configuration state (mainly for testing)
 */
const resetConfig = () => {
  config = null;
  configPromise = null;
};

/**
 * Fetches the configuration file with cache-busting
 * @returns {Promise<Object>} Configuration object
 */
const loadConfig = async () => {
  if (config) {
    return config;
  }

  if (configPromise) {
    return configPromise;
  }

  configPromise = (async () => {
    try {
      // Add timestamp to prevent browser caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/config.json?t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }

      config = await response.json();
      return config;
    } catch (error) {
      console.error('Error loading configuration:', error);
      // Fallback to environment variable if config.json fails
      config = {
        BACKEND_URL: process.env.REACT_APP_BACKEND_URL || ''
      };
      return config;
    } finally {
      configPromise = null;
    }
  })();

  return configPromise;
};

/**
 * Gets the backend URL from configuration
 * @returns {string} Backend URL
 */
const getBackendUrl = () => {
  if (!config) {
    console.warn('Config not loaded yet. Using fallback.');
    return process.env.REACT_APP_BACKEND_URL || '';
  }
  return config.BACKEND_URL;
};

/**
 * Reloads the configuration from the server
 * Useful for runtime configuration changes
 * @returns {Promise<Object>} Updated configuration object
 */
const reloadConfig = async () => {
  resetConfig();
  return loadConfig();
};

/**
 * Gets a configuration value by key
 * @param {string} key - Configuration key
 * @param {*} defaultValue - Default value if key not found
 * @returns {*} Configuration value
 */
const getConfigValue = (key, defaultValue = null) => {
  if (!config) {
    console.warn('Config not loaded yet. Using default value.');
    return defaultValue;
  }
  return config[key] !== undefined ? config[key] : defaultValue;
};

const configService = {
  loadConfig,
  getBackendUrl,
  reloadConfig,
  getConfigValue,
  resetConfig // Export for testing
};

export default configService;
