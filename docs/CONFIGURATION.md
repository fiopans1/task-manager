# Configuration Guide

This document explains how to configure the Task Manager application for deployment.

## Overview

The Task Manager application uses a professional configuration system with separate configuration files for:

1. **Backend** - `application.properties` (Spring Boot configuration)
2. **Frontend** - `config.js` (React application configuration)
3. **Web Server** - `Caddyfile` (Caddy reverse proxy/file server)

All configuration files are generated from templates during the deployment process.

## Configuration Files

### Backend Configuration

**File:** `config/application.properties`  
**Template:** `scripts/config_templates/application-properties.template`

#### Key Settings

```properties
# Application Settings
spring.application.name=Task Manager
server.port=8080

# Frontend URL (for CORS and OAuth2 redirects)
taskmanager.frontend.base-url=http://localhost:3000

# Database Location
spring.datasource.url=jdbc:sqlite:${DEPLOY_ROOT}/metadata/task-manager.db?foreign_keys=on

# JPA Settings (use 'update' for production)
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# OAuth2 (disabled by default)
taskmanager.oauth2.enabled=false
```

#### OAuth2 Providers

To enable OAuth2 authentication, uncomment and configure the appropriate provider section:

**Google:**
```properties
taskmanager.oauth2.google.enabled=true
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
```

**GitHub:**
```properties
taskmanager.oauth2.github.enabled=true
spring.security.oauth2.client.registration.github.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.github.client-secret=YOUR_CLIENT_SECRET
```

**Authentik:**
```properties
taskmanager.oauth2.authentik.enabled=true
spring.security.oauth2.client.registration.authentik.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.authentik.client-secret=YOUR_CLIENT_SECRET
spring.security.oauth2.client.provider.authentik.authorization-uri=https://YOUR_DOMAIN/application/o/authorize/
spring.security.oauth2.client.provider.authentik.token-uri=https://YOUR_DOMAIN/application/o/token/
spring.security.oauth2.client.provider.authentik.user-info-uri=https://YOUR_DOMAIN/application/o/userinfo/
```

### Frontend Configuration

**File:** `lib/frontend/config.js` (copied to `public/config.js` during build)  
**Template:** `scripts/config_templates/config.template.js`

#### Key Settings

```javascript
window.APP_CONFIG = {
  api: {
    // Backend API base URL
    baseUrl: 'http://localhost:8080'
  },
  oauth2: {
    // Enable OAuth2 globally
    enabled: false,
    
    // Provider-specific settings
    google: { enabled: false },
    github: { enabled: false },
    authentik: { enabled: false }
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
```

#### Configuration Loading

The frontend loads configuration from `config.js` before the React app initializes:

1. `index.html` includes `<script src="/config.js"></script>` in the `<head>`
2. Configuration is stored in `window.APP_CONFIG`
3. The `configService` provides access to configuration throughout the app

#### Development vs Production

**Development:**
- Edit `client/public/config.js` directly
- Changes take effect immediately (no rebuild needed)
- File is `.gitignore`d to prevent committing local settings

**Production:**
- Configuration is copied from template during build
- Edit the deployed `config.js` file to change settings
- No frontend rebuild required

### Web Server Configuration

**File:** `config/Caddyfile`  
**Template:** `scripts/config_templates/Caddyfile.template`

#### Key Features

- **SPA Support:** Serves React app with proper routing fallback
- **Security Headers:** HSTS, XSS protection, clickjacking prevention
- **Compression:** Gzip compression for all responses
- **Caching:** Aggressive caching for static assets, no-cache for HTML
- **Port:** Default port 3000 (configurable)

#### Customization

Change the listening port:
```caddyfile
:3000 {  # Change this to your desired port
    root * ../lib/frontend
    # ... rest of config
}
```

For production with HTTPS:
```caddyfile
yourdomain.com {
    root * ../lib/frontend
    # ... rest of config
    tls your-email@example.com
}
```

## Deployment Process

### 1. Build Application

```bash
cd scripts
python3 compile.py --action deploy
```

This will:
1. Build the backend with Maven
2. Copy `config.template.js` to `client/public/config.js`
3. Build the frontend with npm
4. Download Caddy server
5. Copy all configuration templates to `task-manager/config/`
6. Create deployment package `TaskManager.zip`

### 2. Extract Deployment Package

```bash
unzip TaskManager.zip
cd task-manager
```

### 3. Configure Application

Edit configuration files in the `config/` directory:

```bash
# Backend configuration
nano config/application.properties

# Frontend configuration (edit built file directly)
nano lib/frontend/config.js

# Web server configuration
nano config/Caddyfile
```

### 4. Start Application

```bash
# Start backend and frontend
cd bin
python3 start.py --start-all
```

Or start services individually:

```bash
# Backend only
python3 start.py --start-backend --backend-port 8080

# Frontend only
python3 start.py --start-frontend --frontend-port 3000
```

## Migration from Environment Variables

The old system used React environment variables (`REACT_APP_*`). These have been replaced with the `config.js` system.

### Old Approach (Deprecated)

```javascript
// Environment variables (required rebuild)
const apiUrl = process.env.REACT_APP_BACKEND_URL;
const oauth2Enabled = process.env.REACT_APP_OAUTH2_ENABLED === "true";
```

**Problems:**
- Required rebuild to change configuration
- Not suitable for production deployments
- Values baked into bundle at build time

### New Approach

```javascript
// Configuration service (runtime configuration)
import configService from './services/configService';

const apiUrl = configService.getApiBaseUrl();
const oauth2Enabled = configService.isOAuth2Enabled();
```

**Benefits:**
- Change configuration without rebuilding
- Single deployment artifact works in multiple environments
- Better separation of concerns
- Type-safe configuration access

### Fallback Behavior

The `configService` provides fallback to environment variables if `config.js` is not loaded:

```javascript
// Tries to load from window.APP_CONFIG
// Falls back to process.env.REACT_APP_* if not available
configService.getApiBaseUrl();
```

This ensures backward compatibility during migration.

## Troubleshooting

### Frontend can't connect to backend

Check `lib/frontend/config.js`:
```javascript
api: {
  baseUrl: 'http://localhost:8080'  // Must match backend URL
}
```

### OAuth2 not working

1. **Backend:** Check `config/application.properties`:
   ```properties
   taskmanager.oauth2.enabled=true
   taskmanager.oauth2.google.enabled=true
   ```

2. **Frontend:** Check `lib/frontend/config.js`:
   ```javascript
   oauth2: {
     enabled: true,
     google: { enabled: true }
   }
   ```

3. Verify redirect URIs match in OAuth2 provider settings

### Changes not taking effect

1. **Backend:** Restart the backend service
2. **Frontend:** Clear browser cache and reload
3. **Caddy:** Restart Caddy or reload config:
   ```bash
   caddy reload --config config/Caddyfile
   ```

## Best Practices

### Security

1. **Never commit secrets** to version control
2. Use different credentials for each environment
3. Enable HTTPS in production (edit Caddyfile)
4. Restrict CORS origins in production

### Configuration Management

1. Keep templates in version control
2. Keep environment-specific configs separate
3. Document all custom settings
4. Use environment variables for truly sensitive data

### Deployment

1. Test configuration changes in development first
2. Backup configuration before updates
3. Use version numbers in config comments
4. Monitor logs after configuration changes

## Additional Resources

- [Spring Boot Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [OAuth2 Setup Guide](https://developers.google.com/identity/protocols/oauth2)
