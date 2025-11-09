#!/bin/bash
# Script para construir la imagen de Docker de Task Manager
# Soporta multi-arquitectura y compilación integrada

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Función para imprimir mensajes
log() {
    echo -e "${GREEN}[BUILD]${NC} $1"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función de ayuda
show_help() {
    cat << EOF
Uso: $0 [OPCIONES]

Script para construir la imagen Docker de Task Manager con compilación integrada.

OPCIONES:
    -h, --help              Mostrar esta ayuda
    -t, --tag TAG           Tag para la imagen (default: fiopans1/taskmanager:latest)
    -p, --platform PLAT     Plataforma target (default: linux/amd64)
                           Ejemplos: linux/amd64, linux/arm64, linux/arm/v7
    -m, --multi             Construir para múltiples plataformas (amd64,arm64)
    --push                  Push a Docker Hub después de construir
    --no-cache              Construir sin usar caché
    -v, --verbose           Modo verbose
    --git-repo URL          URL del repositorio Git (default: https://github.com/fiopans1/task-manager.git)
    --git-branch BRANCH     Rama a clonar (default: main)

EJEMPLOS:
    # Construir para AMD64 (servidores típicos)
    $0 --platform linux/amd64

    # Construir para ARM64 (Mac M1/M2, Raspberry Pi 4)
    $0 --platform linux/arm64

    # Construir para múltiples arquitecturas
    $0 --multi

    # Construir y hacer push a Docker Hub
    $0 --platform linux/amd64 --push --tag miusuario/taskmanager:v1.0

    # Construir desde una rama específica
    $0 --git-branch develop

    # Construir desde un fork
    $0 --git-repo https://github.com/otrousuario/task-manager.git

EOF
}

# Valores por defecto
IMAGE_TAG="fiopans1/taskmanager:latest"
PLATFORM="linux/amd64"
MULTI_PLATFORM=false
PUSH=false
NO_CACHE=""
VERBOSE=""
GIT_REPO="https://github.com/fiopans1/task-manager.git"
GIT_BRANCH="main"

# Procesar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -m|--multi)
            MULTI_PLATFORM=true
            PLATFORM="linux/amd64,linux/arm64"
            shift
            ;;
        --push)
            PUSH=true
            shift
            ;;
        --no-cache)
            NO_CACHE="--no-cache"
            shift
            ;;
        -v|--verbose)
            VERBOSE="--progress=plain"
            shift
            ;;
        --git-repo)
            GIT_REPO="$2"
            shift 2
            ;;
        --git-branch)
            GIT_BRANCH="$2"
            shift 2
            ;;
        *)
            log_error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Ir al directorio raíz del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

log "Iniciando construcción de imagen Docker de Task Manager"
log_info "Directorio del proyecto: $PROJECT_ROOT"
log_info "Imagen: $IMAGE_TAG"
log_info "Plataforma(s): $PLATFORM"
log_info "Repositorio Git: $GIT_REPO"
log_info "Rama Git: $GIT_BRANCH"

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado"
    exit 1
fi

# Verificar si buildx está disponible para multi-plataforma
if [ "$MULTI_PLATFORM" = true ]; then
    if ! docker buildx version &> /dev/null; then
        log_error "Docker buildx no está disponible"
        log_error "Instala Docker Desktop o habilita buildx"
        exit 1
    fi
    
    # Crear/usar builder multi-plataforma
    log_info "Configurando builder multi-plataforma..."
    docker buildx create --name taskmanager-builder --use 2>/dev/null || docker buildx use taskmanager-builder
    docker buildx inspect --bootstrap
fi

# Construir la imagen
log "Construyendo imagen..."

if [ "$MULTI_PLATFORM" = true ]; then
    # Build multi-plataforma
    BUILD_CMD="docker buildx build"
    PUSH_FLAG=""
    if [ "$PUSH" = true ]; then
        PUSH_FLAG="--push"
    else
        PUSH_FLAG="--load"
        log_warning "Multi-platform build solo puede cargar una plataforma sin --push"
        log_warning "Usando --platform linux/amd64 para cargar localmente"
        PLATFORM="linux/amd64"
    fi
    
    $BUILD_CMD \
        --platform "$PLATFORM" \
        --tag "$IMAGE_TAG" \
        --file docker/Dockerfile.deployment \
        --build-arg GIT_REPO="$GIT_REPO" \
        --build-arg GIT_BRANCH="$GIT_BRANCH" \
        $PUSH_FLAG \
        $NO_CACHE \
        $VERBOSE \
        .
else
    # Build normal
    BUILD_CMD="docker build"
    
    $BUILD_CMD \
        --platform "$PLATFORM" \
        --tag "$IMAGE_TAG" \
        --file docker/Dockerfile.deployment \
        --build-arg GIT_REPO="$GIT_REPO" \
        --build-arg GIT_BRANCH="$GIT_BRANCH" \
        $NO_CACHE \
        $VERBOSE \
        .
    
    # Push si se solicitó
    if [ "$PUSH" = true ]; then
        log "Haciendo push de la imagen..."
        docker push "$IMAGE_TAG"
    fi
fi

log "✅ Imagen construida exitosamente: $IMAGE_TAG"

# Mostrar tamaño de la imagen
if [ "$MULTI_PLATFORM" = false ] || [ "$PUSH" = false ]; then
    IMAGE_SIZE=$(docker images "$IMAGE_TAG" --format "{{.Size}}" | head -n 1)
    log_info "Tamaño de la imagen: $IMAGE_SIZE"
fi

log_info "Para ejecutar la imagen:"
echo "  docker run -d -p 8080:8080 -p 3000:3000 --name taskmanager $IMAGE_TAG"

if [ "$PUSH" = true ]; then
    log "✅ Imagen publicada en Docker Hub"
fi
