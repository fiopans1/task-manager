# External Configuration System

This document describes the runtime configuration system for the Task Manager client application.

## Overview

The application uses an external configuration system that allows runtime configuration changes without rebuilding the application. This is implemented through a `config.json` file that is loaded dynamically when the application starts.

## Features

- **Runtime Configuration**: Change settings without rebuilding the application
- **Cache-Busting**: Prevents browser caching of configuration file using timestamps
- **Fallback Support**: Falls back to environment variables if config.json fails to load
- **No-Cache Headers**: Uses HTTP headers to prevent aggressive caching

## Configuration File

### Location

The configuration file is located at:
- **Development**: `client/public/config.json`
- **Production Build**: `build/config.json` (automatically copied during build)
- **Runtime**: Served from the web root as `/config.json`

### Format

```json
{
  "BACKEND_URL": "http://localhost:8080"
}
```

### Available Settings

- `BACKEND_URL`: The base URL of the backend API server

## Setup Instructions

### For Development

1. Copy the template file:
   ```bash
   cp client/config-template.json client/public/config.json
   ```

2. Edit `client/public/config.json` with your backend URL:
   ```json
   {
     "BACKEND_URL": "http://localhost:8080"
   }
   ```

3. Start the development server:
   ```bash
   cd client
   npm start
   ```

### For Production Deployment

1. After building the application (`npm run build`), the `config.json` file will be automatically copied to the `build` directory.

2. Deploy the `build` directory to your web server.

3. **Important**: To change configuration after deployment:
   - Edit `build/config.json` on your deployed server
   - No rebuild or redeployment is necessary
   - Users may need to refresh their browser (cache-busting helps with this)

## Cache-Busting Mechanism

The configuration service implements several cache-busting strategies:

1. **Timestamp Query Parameter**: Adds `?t={timestamp}` to config.json requests
2. **Cache-Control Headers**: Sends `Cache-Control: no-cache` and `Pragma: no-cache` headers
3. **Fetch API Options**: Uses `cache: 'no-cache'` option

### Example Request
```
GET /config.json?t=1704123456789
Cache-Control: no-cache
Pragma: no-cache
```

This ensures that browsers always fetch the latest configuration from the server.

## Configuration Service API

The `configService` provides the following methods:

### `loadConfig()`
Loads the configuration from `/config.json`. This is called automatically during app initialization.

```javascript
import configService from './services/configService';

await configService.loadConfig();
```

### `getBackendUrl()`
Gets the backend URL from the loaded configuration.

```javascript
const backendUrl = configService.getBackendUrl();
// Returns: "http://localhost:8080"
```

### `reloadConfig()`
Reloads the configuration from the server. Useful for runtime configuration changes.

```javascript
await configService.reloadConfig();
```

### `getConfigValue(key, defaultValue)`
Gets any configuration value by key with an optional default.

```javascript
const value = configService.getConfigValue('BACKEND_URL', 'http://localhost:8080');
```

## Migration from Environment Variables

This implementation maintains backward compatibility with environment variables:

- If `config.json` fails to load, the system falls back to `process.env.REACT_APP_BACKEND_URL`
- This allows gradual migration and provides a safety net

### Previous Implementation
```javascript
const serverUrl = process.env.REACT_APP_BACKEND_URL;
```

### New Implementation
```javascript
import configService from './services/configService';
const serverUrl = configService.getBackendUrl();
```

## Benefits

1. **No Rebuild Required**: Change configuration without rebuilding the entire application
2. **Environment-Agnostic Builds**: Build once, deploy anywhere with different configurations
3. **Runtime Updates**: Update configuration on running applications
4. **Cache Prevention**: Ensures users get the latest configuration
5. **Graceful Degradation**: Falls back to environment variables if needed

## Troubleshooting

### Config not loading
- Check browser console for errors
- Verify `config.json` exists in the deployed directory
- Check network tab to see if config.json is being requested
- Verify the web server is serving static files correctly

### Still using old configuration
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Verify cache-busting timestamp is changing in network requests
- Check if service workers are caching the file

### 404 Error for config.json
- Ensure `config.json` is in the `public` directory for development
- For production, ensure it's in the root of your deployed build directory
- Check web server configuration for static file serving

## Example Deployment Scenarios

### Scenario 1: Multiple Environments

Build once, deploy to multiple environments:

```bash
# Build application
npm run build

# Deploy to development
cp build to dev-server
echo '{"BACKEND_URL": "https://dev-api.example.com"}' > dev-server/config.json

# Deploy to production  
cp build to prod-server
echo '{"BACKEND_URL": "https://api.example.com"}' > prod-server/config.json
```

### Scenario 2: Configuration Update

Update backend URL without redeployment:

```bash
# SSH to server
ssh user@server

# Update config
echo '{"BACKEND_URL": "https://new-api.example.com"}' > /var/www/app/config.json

# Done! Users will get new config on next page load
```

## Security Considerations

- The `config.json` file is publicly accessible
- Do not store sensitive information (API keys, secrets, passwords) in this file
- Only store non-sensitive configuration like URLs
- For sensitive configuration, use backend environment variables

## Future Enhancements

Possible future improvements:

1. Support for multiple environments in a single config file
2. Configuration validation and schema
3. Configuration UI for runtime updates
4. Version tracking for configuration changes
5. A/B testing configuration support
