# Task Manager - Quick Reference

## 🚀 Quick Commands

### Compilation

```bash
# Build compilation image
docker build -f docker/Dockerfile.build -t fiopans1/taskmanager-compilation:latest .

# Compile project
docker run -v $(pwd):/output fiopans1/taskmanager-compilation:latest compile

# Result: TaskManager.zip in current directory
```

### Deployment

```bash
# Build deployment image (requires TaskManager.zip)
docker build -f docker/Dockerfile.deployment -t fiopans1/taskmanager-deployment:latest .

# Run with default ports (8080, 3000)
docker run -d -p 8080:8080 -p 3000:3000 --name taskmanager \
  -v taskmanager-data:/app/bd \
  fiopans1/taskmanager-deployment:latest

# Run with custom ports
docker run -d -p 9090:9090 -p 4000:4000 --name taskmanager \
  -v taskmanager-data:/app/bd \
  fiopans1/taskmanager-deployment:latest \
  --backend-port 9090 --frontend-port 4000
```

### Docker Compose

```bash
# Start with docker-compose
cd docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Management

```bash
# View logs
docker logs -f taskmanager

# Check health
curl http://localhost:8080/health

# Stop container
docker stop taskmanager

# Start container
docker start taskmanager

# Remove container
docker rm -f taskmanager

# Interactive shell
docker exec -it taskmanager bash
```

### Manual Operations (inside container)

```bash
# Extract and prepare environment
/app/prepare_environment.sh

# Start all services
cd /app/task-manager/bin
python3 start.py --start-all --project-root /app/task-manager

# Stop all services
python3 stop.py
```

## 📊 Monitoring

```bash
# Container stats
docker stats taskmanager

# Check running processes
docker exec taskmanager ps aux

# Check ports in use
docker exec taskmanager lsof -i :8080
docker exec taskmanager lsof -i :3000
```

## 🐛 Debugging

```bash
# Run in interactive mode
docker run -it -p 8080:8080 -p 3000:3000 \
  fiopans1/taskmanager-deployment:latest bash

# View deployment scripts
docker exec taskmanager ls -la /app/

# Check extracted files
docker exec taskmanager ls -la /app/task-manager/

# Test backend manually
docker exec taskmanager curl http://localhost:8080/health

# Check Java process
docker exec taskmanager ps aux | grep java

# Check Caddy process
docker exec taskmanager ps aux | grep caddy
```

## 🧹 Cleanup

```bash
# Stop and remove container
docker stop taskmanager && docker rm taskmanager

# Remove image
docker rmi fiopans1/taskmanager-deployment:latest

# Remove volume (WARNING: deletes data)
docker volume rm taskmanager-data

# Full cleanup
docker-compose down -v
docker rmi fiopans1/taskmanager-deployment:latest
docker rmi fiopans1/taskmanager-compilation:latest
```

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| BACKEND_PORT | 8080 | Backend service port |
| FRONTEND_PORT | 3000 | Frontend service port |
| NAME_JAR_FILE | taskmanager.jar | JAR file name |
| PROJECT_ROOT | /app/task-manager | Project root directory |

## 📝 Common Issues

### Port already in use
```bash
# Find process using port
lsof -ti:8080
# Kill process
kill -9 $(lsof -ti:8080)
```

### Container exits immediately
```bash
# Check logs
docker logs taskmanager
# Run in foreground for debugging
docker run --rm -p 8080:8080 -p 3000:3000 fiopans1/taskmanager-deployment:latest
```

### Need to rebuild
```bash
# Remove old image and rebuild
docker rmi fiopans1/taskmanager-deployment:latest
docker build -f docker/Dockerfile.deployment -t fiopans1/taskmanager-deployment:latest .
```

For detailed documentation, see [DEPLOYMENT_README.md](DEPLOYMENT_README.md)
