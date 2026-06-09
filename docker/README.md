# Task Manager Docker Guide

This directory contains the Docker assets used to build and distribute Task Manager as a container image.

The main entry point is `build.sh`, which wraps the Docker build command and lets you choose the target platform, image tag, source repository and branch to build.

## Files in this directory

- `Dockerfile.deployment` — multi-stage image used for packaging and runtime
- `Dockerfile.build` — legacy build image kept for compatibility
- `build.sh` — helper script for local and CI/CD builds
- `scripts_compilation/` — scripts used during the image build stage
- `scripts_deployment/` — scripts used during the deployment/runtime stage

## Requirements

- Docker installed locally
- Docker Buildx enabled for multi-platform images

## Quick start

### Build the default image

```bash
./docker/build.sh
```

This builds `fiopans1/taskmanager:latest` for `linux/amd64`.

### Build for ARM64

```bash
./docker/build.sh --platform linux/arm64
```

### Build and push your own tag

```bash
./docker/build.sh --platform linux/amd64 --push --tag youruser/taskmanager:latest
```

### Multi-platform build

```bash
./docker/build.sh --multi --push --tag youruser/taskmanager:latest
```

## How the Docker build works

`Dockerfile.deployment` uses a multi-stage process:

1. **Builder stage**
   - Starts from Java 23
   - Installs the tooling needed to package the project
   - Fetches the repository and builds the application
2. **Runtime stage**
   - Copies the packaged output
   - Prepares the final runtime image
   - Exposes the application for backend and frontend access

This approach keeps the runtime image separate from the heavier build environment.

## Supported command-line options

```bash
./docker/build.sh [OPTIONS]

Options:
  -h, --help              Show help
  -t, --tag TAG           Image tag (default: fiopans1/taskmanager:latest)
  -p, --platform PLAT     Target platform (default: linux/amd64)
  -m, --multi             Build for multiple platforms (amd64, arm64)
  --push                  Push the image after building
  --no-cache              Build without cache
  -v, --verbose           Show verbose Docker output
  --git-repo URL          Repository to clone during the build
  --git-branch BRANCH     Branch to clone during the build
```

## Practical examples

### Build from a feature branch

```bash
./docker/build.sh --git-branch feature/improve-auth
```

### Build from a fork

```bash
./docker/build.sh --git-repo https://github.com/otherusername/task-manager.git --git-branch main
```

### Run the generated image

```bash
docker run -d \
  -p 8080:8080 \
  -p 3000:3000 \
  --name taskmanager \
  fiopans1/taskmanager:latest
```

## Troubleshooting

### `docker buildx` is missing

Check whether Buildx is available:

```bash
docker buildx version
```

If it is missing, install Docker Desktop or enable the Buildx plugin in your Docker environment.

### Multi-platform builds fail

If your host does not have the required emulation support, install QEMU:

```bash
docker run --privileged --rm tonistiigi/binfmt --install all
```

### You only need a local image

If you do not plan to publish the result, omit `--push`. For regular local work, `./docker/build.sh` is usually enough.
