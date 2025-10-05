/**
 * Tests for configService
 */

import configService from './configService';

// Mock fetch globally
global.fetch = jest.fn();

describe('configService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset config service state
    configService.resetConfig();
    // Clear environment variable
    delete process.env.REACT_APP_BACKEND_URL;
  });

  describe('loadConfig', () => {
    it('should load config from config.json with cache-busting', async () => {
      const mockConfig = { BACKEND_URL: 'http://test-server:8080' };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });

      const config = await configService.loadConfig();
      
      expect(config).toEqual(mockConfig);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      // Verify cache-busting timestamp query parameter
      const fetchCall = global.fetch.mock.calls[0][0];
      expect(fetchCall).toMatch(/\/config\.json\?t=\d+/);
      
      // Verify no-cache headers
      const fetchOptions = global.fetch.mock.calls[0][1];
      expect(fetchOptions.cache).toBe('no-cache');
      expect(fetchOptions.headers['Cache-Control']).toBe('no-cache');
      expect(fetchOptions.headers['Pragma']).toBe('no-cache');
    });

    it('should cache config after first load', async () => {
      const mockConfig = { BACKEND_URL: 'http://test-server:8080' };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });

      // First call should fetch
      const config1 = await configService.loadConfig();
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const config2 = await configService.loadConfig();
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, not 2
      expect(config1).toEqual(config2);
    });

    it('should fallback to environment variable on fetch failure', async () => {
      process.env.REACT_APP_BACKEND_URL = 'http://fallback:8080';
      
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const config = await configService.loadConfig();
      
      expect(config.BACKEND_URL).toBe('http://fallback:8080');
    });

    it('should fallback to environment variable on non-ok response', async () => {
      process.env.REACT_APP_BACKEND_URL = 'http://fallback:8080';
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const config = await configService.loadConfig();
      
      expect(config.BACKEND_URL).toBe('http://fallback:8080');
    });

    it('should handle concurrent load requests', async () => {
      const mockConfig = { BACKEND_URL: 'http://test-server:8080' };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });

      // Make multiple concurrent requests
      const results = await Promise.all([
        configService.loadConfig(),
        configService.loadConfig(),
        configService.loadConfig()
      ]);
      
      // Should only fetch once
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      // All results should be the same
      expect(results[0]).toEqual(mockConfig);
      expect(results[1]).toEqual(mockConfig);
      expect(results[2]).toEqual(mockConfig);
    });
  });

  describe('getBackendUrl', () => {
    it('should return backend URL from loaded config', async () => {
      const mockConfig = { BACKEND_URL: 'http://test-server:8080' };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });

      await configService.loadConfig();
      const url = configService.getBackendUrl();
      
      expect(url).toBe('http://test-server:8080');
    });

    it('should return fallback if config not loaded', () => {
      process.env.REACT_APP_BACKEND_URL = 'http://fallback:8080';
      
      const url = configService.getBackendUrl();
      
      expect(url).toBe('http://fallback:8080');
    });
  });

  describe('reloadConfig', () => {
    it('should reload config from server', async () => {
      const mockConfig1 = { BACKEND_URL: 'http://server1:8080' };
      const mockConfig2 = { BACKEND_URL: 'http://server2:8080' };
      
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockConfig1
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockConfig2
        });

      // Load first config
      const config1 = await configService.loadConfig();
      expect(config1.BACKEND_URL).toBe('http://server1:8080');
      
      // Reload should fetch new config
      const config2 = await configService.reloadConfig();
      expect(config2.BACKEND_URL).toBe('http://server2:8080');
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should generate new cache-busting timestamp on reload', async () => {
      const mockConfig = { BACKEND_URL: 'http://test-server:8080' };
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockConfig
      });

      await configService.loadConfig();
      const firstTimestamp = global.fetch.mock.calls[0][0].match(/t=(\d+)/)[1];
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await configService.reloadConfig();
      const secondTimestamp = global.fetch.mock.calls[1][0].match(/t=(\d+)/)[1];
      
      expect(parseInt(secondTimestamp)).toBeGreaterThan(parseInt(firstTimestamp));
    });
  });

  describe('getConfigValue', () => {
    it('should return config value by key', async () => {
      const mockConfig = { 
        BACKEND_URL: 'http://test-server:8080',
        OTHER_SETTING: 'value'
      };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });

      await configService.loadConfig();
      
      expect(configService.getConfigValue('BACKEND_URL')).toBe('http://test-server:8080');
      expect(configService.getConfigValue('OTHER_SETTING')).toBe('value');
    });

    it('should return default value if key not found', async () => {
      const mockConfig = { BACKEND_URL: 'http://test-server:8080' };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });

      await configService.loadConfig();
      
      expect(configService.getConfigValue('NON_EXISTENT', 'default')).toBe('default');
    });

    it('should return default value if config not loaded', () => {
      expect(configService.getConfigValue('ANY_KEY', 'default')).toBe('default');
    });

    it('should return null if no default provided and key not found', async () => {
      const mockConfig = { BACKEND_URL: 'http://test-server:8080' };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });

      await configService.loadConfig();
      
      expect(configService.getConfigValue('NON_EXISTENT')).toBeNull();
    });
  });
});
