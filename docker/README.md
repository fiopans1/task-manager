# Task Manager — Docker Build

This directory contains the Docker files for building and deploying Task Manager.

## Files

- `Dockerfile.deployment` — Multi-stage Dockerfile that compiles and deploys the application.
- `Dockerfile.build` — (Deprecated) Build-only Dockerfile.
- `build.sh` — Helper script to build the image easily.
- `scripts_compilation/` — Scripts used during the compilation stage.
- `scripts_deployment/` — Scripts used during the deployment stage.

## Quick Start

### Simple Build

```bash
# Typical servers (AMD64)
./docker/build.sh --platform linux/amd64

# Mac M1/M2 (ARM64)
./docker/build.sh --platform linux/arm64
```

### Build and Push to Docker Hub

```bash
./docker/build.sh --platform linux/amd64 --push --tag yourusername/taskmanager:latest
```

### Multi-Architecture Build

```bash
./docker/build.sh --multi --push --tag yourusername/taskmanager:latest
```

## Multi-Stage Architecture

`Dockerfile.deployment` uses a multi-stage build:

### Stage 1: Builder

- Base image: `eclipse-temurin:23-jdk`
- Installs: Maven, Node.js, Python, Git
- Clones: repository from GitHub
- Compiles: backend (JAR) and frontend (React)
- Generates: `TaskManager.zip`

### Stage 2: Runtime

- Base image: `eclipse-temurin:23-jdk`
- Installs: runtime dependencies only
- Copies: `TaskManager.zip` from the builder stage
- Executes: extraction, configuration, and startup

## Supported Platforms

| Platform       | Use Cases                               |
| -------------- | --------------------------------------- |
| `linux/amd64`  | Servers, VPS, x86_64 PCs               |
| `linux/arm64`  | Mac M1/M2, Raspberry Pi 4, AWS Graviton |
| `linux/arm/v7` | Raspberry Pi 3 and older                |

## Build Script Options

```bash
./docker/build.sh [OPTIONS]

Options:
  -h, --help              Show help
  -t, --tag TAG           Image tag (default: fiopans1/taskmanager:latest)
  -p, --platform PLAT     Target platform (default: linux/amd64)
  -m, --multi             Build for multiple platforms
  --push                  Push to Docker Hub after building
  --no-cache              Build without cache
  -v, --verbose           Verbose mode
  --git-repo URL          Repository URL (default: https://github.com/fiopans1/task-manager.git)
  --git-branch BRANCH     Branch to clone (default: main)
```

## Examples

### Local Development

```bash
# Build for your architecture from main
./docker/build.sh

# Build from a specific branch
./docker/build.sh --git-branch develop

# Run
docker run -d -p 8080:8080 -p 3000:3000 --name taskmanager fiopans1/taskmanager:latest
```

### Production on AMD64 Server

```bash
./docker/build.sh --platform linux/amd64 --tag myapp/taskmanager:v1.0.0
./docker/build.sh --platform linux/amd64 --push --tag myapp/taskmanager:v1.0.0
```

### Build from a Fork

```bash
./docker/build.sh --git-repo https://github.com/otherusername/task-manager.git --git-branch feature-x
```

### CI/CD with GitHub Actions

```yaml
- name: Build and Push Docker Image
  run: |
    chmod +x docker/build.sh
    ./docker/build.sh --multi --push --tag ${{ secrets.DOCKER_USERNAME }}/taskmanager:${{ github.sha }}
```

## Troubleshooting

### Error: "docker buildx not found"

Install Docker Desktop or enable buildx:

```bash
docker buildx version
```

### Slow build

Use `--no-cache` only when necessary. Docker caches layers automatically.

### Multi-platform build fails

Make sure QEMU is installed:

```bash
docker run --privileged --rm tonistiigi/binfmt --install all
```

## References

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [Multi-Platform Images](https://docs.docker.com/build/building/multi-platform/)
