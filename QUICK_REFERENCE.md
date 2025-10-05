# External Configuration Quick Reference

## 🚀 Quick Start

### Development
```bash
cd client
cp config-template.json public/config.json
# Edit public/config.json with your backend URL
npm start
```

### Production
```bash
cd client
npm run build
# Deploy build directory
# Edit build/config.json on server (no rebuild needed!)
```

## 📁 File Structure

```
task-manager/
├── CONFIGURATION.md              # Full documentation
├── IMPLEMENTATION_SUMMARY.md     # Technical details
└── client/
    ├── config-template.json      # Template (committed)
    ├── public/
    │   ├── config.json           # Runtime config (gitignored)
    │   └── config-demo.html      # Interactive demo
    └── src/
        ├── index.js              # Loads config on startup
        └── services/
            ├── configService.js       # Core service
            ├── configService.test.js  # Tests (13/13 ✅)
            ├── taskService.js         # Uses configService
            ├── authService.js         # Uses configService
            └── listService.js         # Uses configService
```

## 🔧 Configuration File Format

**File**: `config.json`
```json
{
  "BACKEND_URL": "http://localhost:8080"
}
```

## 🎯 Usage in Code

### Get Backend URL
```javascript
import configService from './services/configService';

const url = configService.getBackendUrl();
```

### Get Custom Config Value
```javascript
const value = configService.getConfigValue('SOME_KEY', 'default');
```

### Reload Configuration
```javascript
await configService.reloadConfig();
```

## 🛡️ Cache-Busting Features

Every request to `config.json` includes:

1. **Timestamp**: `config.json?t=1704123456789`
2. **Headers**: `Cache-Control: no-cache`
3. **Fetch option**: `cache: 'no-cache'`

This ensures **no caching** and **immediate updates**.

## 🎪 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Startup                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   index.js loads      │
              │   configService       │
              └───────────┬───────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │  GET /config.json?t=timestamp  │
         │  Headers: Cache-Control...     │
         └────────────┬───────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  Server       │
              │  responds     │
              └───────┬───────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
    SUCCESS                       FAILURE
        │                           │
        ▼                           ▼
 ┌──────────────┐         ┌─────────────────┐
 │ Cache config │         │ Fallback to     │
 │ in memory    │         │ process.env     │
 └──────┬───────┘         └─────────────────┘
        │
        ▼
 ┌──────────────────────────┐
 │ App renders with config  │
 │ All services use         │
 │ configService.get...()   │
 └──────────────────────────┘
```

## 🔄 Runtime Configuration Update Flow

```
Developer/DevOps         Server                  Users
     │                     │                       │
     │  1. Edit            │                       │
     │  config.json ────►  │                       │
     │                     │                       │
     │                     │  2. User loads page   │
     │                     │  ◄─────────────────── │
     │                     │                       │
     │                     │  3. Fetch config.json │
     │                     │  with timestamp       │
     │                     │  ◄─────────────────── │
     │                     │                       │
     │                     │  4. New config        │
     │                     │  ──────────────────►  │
     │                     │                       │
     │                     │  5. App uses new URL  │
     │                     │  ◄──────────────────► │
     │                     │                       │
```

## 📋 Deployment Checklist

- [ ] Copy `config-template.json` to `public/config.json`
- [ ] Edit `config.json` with your backend URL
- [ ] Build: `npm run build`
- [ ] Verify `build/config.json` exists
- [ ] Deploy `build` directory
- [ ] Test in browser (check Network tab)
- [ ] Verify timestamp in request URL
- [ ] Test runtime update by editing config

## 🧪 Testing

### Run Unit Tests
```bash
cd client
npm test -- configService.test.js
```

**Expected**: 13/13 tests passing ✅

### Test Coverage
- ✅ Config loading with cache-busting
- ✅ Concurrent requests handling
- ✅ Fallback to environment variables
- ✅ Configuration caching
- ✅ Runtime reload
- ✅ Value retrieval

### Manual Test
1. Open `http://localhost:3000/config-demo.html`
2. Click "Load Configuration"
3. Observe timestamp in request
4. Edit `public/config.json`
5. Click "Reload Configuration"
6. See updated config immediately

## ⚠️ Important Notes

### DO ✅
- Store non-sensitive configuration (URLs, feature flags)
- Use for environment-specific settings
- Edit config.json in deployed environment
- Commit config-template.json

### DON'T ❌
- Store API keys or secrets
- Store passwords or tokens
- Commit config.json (it's gitignored)
- Remove fallback to environment variables

## 🔍 Troubleshooting

### Config not loading
**Check**: Browser console for errors
**Fix**: Verify `config.json` exists and is valid JSON

### Using old configuration
**Check**: Network tab for timestamp parameter
**Fix**: Hard refresh (Ctrl+Shift+R)

### 404 for config.json
**Check**: File exists in correct location
**Fix**: Ensure `public/config.json` exists (dev) or `build/config.json` (prod)

## 📚 Documentation

- **Full Guide**: `CONFIGURATION.md`
- **Technical Details**: `IMPLEMENTATION_SUMMARY.md`
- **Client Docs**: `client/README.md`
- **Interactive Demo**: `client/public/config-demo.html`

## 🎨 Example Use Cases

### Different Environments
```bash
# Development
echo '{"BACKEND_URL":"http://localhost:8080"}' > config.json

# Staging
echo '{"BACKEND_URL":"https://staging-api.example.com"}' > config.json

# Production
echo '{"BACKEND_URL":"https://api.example.com"}' > config.json
```

### Zero-Downtime Config Update
```bash
# SSH to production server
ssh user@prod-server

# Update config (no deployment needed!)
vim /var/www/app/config.json

# Users get new config on next page load
# No rebuild, no downtime! 🎉
```

## 💡 Benefits

1. **No Rebuild** - Change config without rebuilding app
2. **One Build** - Same build for all environments
3. **Instant Updates** - Changes apply immediately
4. **Cache-Proof** - Always get latest config
5. **Safe** - Falls back to environment variables

---

**Need Help?** See `CONFIGURATION.md` for detailed documentation.
