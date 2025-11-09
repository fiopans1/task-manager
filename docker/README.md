# Task Manager - Docker Build

Este directorio contiene los archivos de Docker para construir y desplegar Task Manager.

## 📁 Archivos

- `Dockerfile.deployment` - Dockerfile multi-stage que compila y despliega la aplicación
- `Dockerfile.build` - (Deprecated) Dockerfile solo para compilación
- `build.sh` - Script helper para construir la imagen fácilmente
- `scripts_compilation/` - Scripts para la etapa de compilación
- `scripts_deployment/` - Scripts para la etapa de despliegue

## 🚀 Uso Rápido

### Construcción Simple

```bash
# Para servidores típicos (AMD64)
./docker/build.sh --platform linux/amd64

# Para Mac M1/M2 (ARM64)
./docker/build.sh --platform linux/arm64
```

### Construcción y Push a Docker Hub

```bash
# Construir y publicar
./docker/build.sh --platform linux/amd64 --push --tag tuusuario/taskmanager:latest
```

### Construcción Multi-Arquitectura

```bash
# Construir para múltiples plataformas y hacer push
./docker/build.sh --multi --push --tag tuusuario/taskmanager:latest
```

## 🏗️ Arquitectura Multi-Stage

El `Dockerfile.deployment` usa multi-stage build:

### Stage 1: Builder

- Base: `eclipse-temurin:23-jdk`
- Instala: Maven, Node.js, Python, Git
- Clona: Repositorio desde GitHub
- Compila: Backend (JAR) y Frontend (React)
- Genera: `TaskManager.zip`

### Stage 2: Runtime

- Base: `eclipse-temurin:23-jdk`
- Instala: Solo dependencias de runtime
- Copia: `TaskManager.zip` desde stage builder
- Ejecuta: Extracción, configuración y arranque

## 📊 Ventajas del Enfoque Actual

1. **Un solo comando**: No necesitas compilar y desplegar por separado
2. **Multi-arquitectura**: Construye para cualquier plataforma desde cualquier máquina
3. **Caché eficiente**: Docker cachea las capas de compilación
4. **Imagen más pequeña**: La imagen final no incluye herramientas de build
5. **Reproducible**: Siempre compila desde el código fuente

## 🎯 Plataformas Soportadas

| Plataforma     | Casos de Uso                            |
| -------------- | --------------------------------------- |
| `linux/amd64`  | Servidores, VPS, PCs x86_64             |
| `linux/arm64`  | Mac M1/M2, Raspberry Pi 4, AWS Graviton |
| `linux/arm/v7` | Raspberry Pi 3 y anteriores             |

## ⚙️ Opciones del Script de Build

```bash
./docker/build.sh [OPCIONES]

Opciones:
  -h, --help              Mostrar ayuda
  -t, --tag TAG           Tag para la imagen (default: fiopans1/taskmanager:latest)
  -p, --platform PLAT     Plataforma target (default: linux/amd64)
  -m, --multi             Construir para múltiples plataformas
  --push                  Push a Docker Hub después de construir
  --no-cache              Construir sin usar caché
  -v, --verbose           Modo verbose
  --git-repo URL          URL del repositorio (default: https://github.com/fiopans1/task-manager.git)
  --git-branch BRANCH     Rama a clonar (default: main)
```

## 📝 Ejemplos

### Desarrollo Local

```bash
# Construir para tu arquitectura desde main
./docker/build.sh

# Construir desde una rama específica
./docker/build.sh --git-branch develop

# Ejecutar
docker run -d -p 8080:8080 -p 3000:3000 --name taskmanager fiopans1/taskmanager:latest
```

### Producción en Servidor AMD64

```bash
# Construir para AMD64
./docker/build.sh --platform linux/amd64 --tag myapp/taskmanager:v1.0.0

# Push a registry
./docker/build.sh --platform linux/amd64 --push --tag myapp/taskmanager:v1.0.0
```

### Construir desde un Fork

```bash
# Construir desde otro repositorio
./docker/build.sh --git-repo https://github.com/otrousuario/task-manager.git --git-branch feature-x
```

### CI/CD con GitHub Actions

```yaml
- name: Build and Push Docker Image
  run: |
    chmod +x docker/build.sh
    ./docker/build.sh --multi --push --tag ${{ secrets.DOCKER_USERNAME }}/taskmanager:${{ github.sha }}
```

````

## 📝 Ejemplos

### Desarrollo Local

```bash
# Construir para tu arquitectura
./docker/build.sh

# Ejecutar
docker run -d -p 8080:8080 -p 3000:3000 --name taskmanager fiopans1/taskmanager:latest
````

### Producción en Servidor AMD64

```bash
# Construir para AMD64
./docker/build.sh --platform linux/amd64 --tag myapp/taskmanager:v1.0.0

# Push a registry
./docker/build.sh --platform linux/amd64 --push --tag myapp/taskmanager:v1.0.0
```

### CI/CD con GitHub Actions

```yaml
- name: Build and Push Docker Image
  run: |
    chmod +x docker/build.sh
    ./docker/build.sh --multi --push --tag ${{ secrets.DOCKER_USERNAME }}/taskmanager:${{ github.sha }}
```

## 🔍 Troubleshooting

### Error: "docker buildx not found"

Instala Docker Desktop o habilita buildx:

```bash
docker buildx version
```

### Build muy lento

Usa `--no-cache` solo cuando sea necesario. Docker cachea las capas automáticamente.

### Multi-platform build falla

Asegúrate de tener QEMU instalado:

```bash
docker run --privileged --rm tonistiigi/binfmt --install all
```

## 📚 Referencias

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [Multi-Platform Images](https://docs.docker.com/build/building/multi-platform/)
