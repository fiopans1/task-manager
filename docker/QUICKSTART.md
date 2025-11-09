# 🚀 Guía Rápida - Docker Build con Git Clone

## ¿Qué hace este build?

El Dockerfile ahora **clona automáticamente el repositorio desde GitHub** durante el build y compila todo desde cero.

**Ventajas**:

- ✅ No necesitas tener el código fuente localmente
- ✅ Compila siempre desde la última versión del repositorio
- ✅ Ideal para CI/CD y despliegues en servidores
- ✅ Reproducible en cualquier máquina

## 📦 Uso Básico

### 1. Build Rápido (Rama Main)

```bash
# Construcción para AMD64 (servidores típicos)
./docker/build.sh --platform linux/amd64

# Construcción para ARM64 (Mac M1/M2)
./docker/build.sh --platform linux/arm64
```

### 2. Build desde Rama Específica

```bash
# Construir desde rama develop
./docker/build.sh --platform linux/amd64 --git-branch develop

# Construir desde rama feature
./docker/build.sh --git-branch feature/new-ui
```

### 3. Build desde Fork o Otro Repositorio

```bash
# Construir desde un fork
./docker/build.sh \
  --git-repo https://github.com/otrousuario/task-manager.git \
  --git-branch main \
  --platform linux/amd64
```

### 4. Build y Push a Docker Hub

```bash
# Construir y publicar
./docker/build.sh \
  --platform linux/amd64 \
  --push \
  --tag miusuario/taskmanager:v1.0.0
```

## 🐳 Usando Docker Compose

Puedes configurar el repositorio y rama en un archivo `.env`:

```bash
# Crear archivo .env
cd docker
cp .env.example .env

# Editar .env
nano .env
```

**Contenido del .env**:

```bash
GIT_REPO=https://github.com/fiopans1/task-manager.git
GIT_BRANCH=main
BACKEND_PORT=8080
FRONTEND_PORT=3000
```

**Construir y ejecutar**:

```bash
# Construir
docker-compose build

# Ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 🔧 Build Manual con Docker

Si prefieres usar Docker directamente:

```bash
# Build básico
docker build \
  -f docker/Dockerfile.deployment \
  -t fiopans1/taskmanager:latest \
  .

# Build con parámetros personalizados
docker build \
  -f docker/Dockerfile.deployment \
  --build-arg GIT_REPO=https://github.com/fiopans1/task-manager.git \
  --build-arg GIT_BRANCH=develop \
  --platform linux/amd64 \
  -t fiopans1/taskmanager:develop \
  .
```

## 📊 Proceso de Build

```
┌─────────────────────────────────────────┐
│  STAGE 1: Builder                       │
├─────────────────────────────────────────┤
│  1. Instalar herramientas               │
│     - Maven, Node.js, Python, Git       │
│  2. Clonar repositorio                  │
│     - git clone --depth 1               │
│  3. Compilar backend                    │
│     - mvn clean package                 │
│  4. Compilar frontend                   │
│     - npm install && npm run build      │
│  5. Generar TaskManager.zip             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  STAGE 2: Runtime                       │
├─────────────────────────────────────────┤
│  1. Copiar TaskManager.zip              │
│  2. Configurar entrypoint               │
│  3. Imagen final optimizada             │
│     (sin herramientas de build)         │
└─────────────────────────────────────────┘
```

## 🌍 Multi-Arquitectura

Para construir una imagen que funcione en múltiples arquitecturas:

```bash
# Configurar buildx (solo primera vez)
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap

# Build multi-arch y push
./docker/build.sh --multi --push --tag miusuario/taskmanager:latest
```

Esto crea una imagen que funciona en:

- `linux/amd64` - Servidores x86_64
- `linux/arm64` - Mac M1/M2, ARM servers
- `linux/arm/v7` - Raspberry Pi 3

## 🎯 Casos de Uso

### Desarrollo Local (Mac M1)

```bash
# Construir para tu Mac
./docker/build.sh --platform linux/arm64

# Ejecutar
docker run -d \
  -p 8080:8080 \
  -p 3000:3000 \
  --name taskmanager \
  fiopans1/taskmanager:latest
```

### Despliegue en Servidor Linux (AMD64)

```bash
# Desde tu Mac, construir para el servidor
./docker/build.sh \
  --platform linux/amd64 \
  --push \
  --tag miusuario/taskmanager:prod

# En el servidor
docker pull miusuario/taskmanager:prod
docker run -d \
  -p 8080:8080 \
  -p 3000:3000 \
  -v /data/taskmanager:/app/metadata \
  --name taskmanager \
  miusuario/taskmanager:prod
```

### CI/CD con GitHub Actions

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
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

## 🔍 Troubleshooting

### Error: "fatal: Remote branch not found"

La rama especificada no existe. Verifica:

```bash
# Ver ramas disponibles
git ls-remote --heads https://github.com/fiopans1/task-manager.git
```

### Error: "repository not found"

Repositorio privado o URL incorrecta. Para repos privados, necesitas configurar credenciales:

```bash
# Opción 1: Usar token en la URL
GIT_REPO=https://token@github.com/usuario/repo.git

# Opción 2: Configurar credenciales en el Dockerfile
# (requiere modificar el Dockerfile para usar git credential helper)
```

### Build muy lento

Primera build es lenta (descarga dependencias). Builds subsecuentes son más rápidas gracias al caché de Docker.

Para limpiar caché y rebuild completo:

```bash
./docker/build.sh --no-cache --platform linux/amd64
```

### Imagen muy grande

La imagen final usa multi-stage build y es optimizada. Solo contiene:

- JDK runtime
- TaskManager.zip
- Scripts de deployment

El stage de build (con Maven, Node, etc.) se descarta automáticamente.

## 📚 Más Información

- Ver `docker/README.md` para documentación completa
- Ver `docker/MIGRATION.md` para detalles de cambios
- Ver `docker/.env.example` para todas las variables disponibles
