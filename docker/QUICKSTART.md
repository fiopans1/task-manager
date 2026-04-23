# Quick Start — Docker Build

## What does this build do?

The Dockerfile **automatically clones the repository from GitHub** during the build and compiles everything from scratch.

**Benefits:**

- ✅ No need to have the source code locally
- ✅ Always compiles from the latest version of the repository
- ✅ Ideal for CI/CD and server deployments
- ✅ Reproducible on any machine

## Basic Usage

### 1. Quick Build (main branch)

```bash
# AMD64 (typical servers)
./docker/build.sh --platform linux/amd64

# ARM64 (Mac M1/M2)
./docker/build.sh --platform linux/arm64
```

### 2. Build from a Specific Branch

```bash
./docker/build.sh --platform linux/amd64 --git-branch develop
./docker/build.sh --git-branch feature/new-ui
```

### 3. Build from a Fork

```bash
./docker/build.sh \
  --git-repo https://github.com/otherusername/task-manager.git \
  --git-branch main \
  --platform linux/amd64
```

### 4. Build and Push to Docker Hub

```bash
./docker/build.sh \
  --platform linux/amd64 \
  --push \
  --tag myusername/taskmanager:v1.0.0
```

## Build Process

```
┌─────────────────────────────────────────┐
│  STAGE 1: Builder                       │
├─────────────────────────────────────────┤
│  1. Install tools                       │
│     - Maven, Node.js, Python, Git       │
│  2. Clone repository                    │
│     - git clone --depth 1               │
│  3. Compile backend                     │
│     - mvn clean package                 │
│  4. Compile frontend                    │
│     - pnpm install && pnpm run build    │
│  5. Generate TaskManager.zip            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  STAGE 2: Runtime                       │
├─────────────────────────────────────────┤
│  1. Copy TaskManager.zip                │
│  2. Configure entrypoint                │
│  3. Optimised final image               │
│     (no build tools included)           │
└─────────────────────────────────────────┘
```

## Multi-Architecture

```bash
# Set up buildx (first time only)
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap

# Multi-arch build and push
./docker/build.sh --multi --push --tag myusername/taskmanager:latest
```

## CI/CD with GitHub Actions

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and Push
        run: |
          chmod +x docker/build.sh
          ./docker/build.sh \
            --multi \
            --push \
            --tag ${{ secrets.DOCKER_USERNAME }}/taskmanager:${{ github.sha }} \
            --tag ${{ secrets.DOCKER_USERNAME }}/taskmanager:latest
```

## Troubleshooting

### "fatal: Remote branch not found"

Check available branches:

```bash
git ls-remote --heads https://github.com/fiopans1/task-manager.git
```

### "repository not found"

For private repositories, pass credentials in the URL:

```bash
GIT_REPO=https://TOKEN@github.com/username/repo.git
```

### First build is slow

Maven and Node dependencies are downloaded on the first run. Subsequent builds are faster thanks to Docker layer caching.

## More Information

- See `docker/README.md` for full documentation.
