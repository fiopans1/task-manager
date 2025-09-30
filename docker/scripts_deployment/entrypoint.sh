#!/bin/bash
# Script entrypoint.sh para el contenedor de despliegue de Task Manager
# Este script maneja el inicio y detención de la aplicación Task Manager

set -e  # Salir inmediatamente si algún comando falla

# Colores para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con formato
log() {
    echo -e "${GREEN}[ENTRYPOINT]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Función para mostrar la ayuda
show_help() {
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones disponibles:"
    echo "  --start-all               Iniciar backend y frontend (default)"
    echo "  --start-backend           Iniciar solo el backend"
    echo "  --start-frontend          Iniciar solo el frontend"
    echo "  --stop                    Detener la aplicación"
    echo "  --stop-backend            Detener solo el backend"
    echo "  --stop-frontend           Detener solo el frontend"
    echo "  --backend-port PORT       Puerto del backend (default: 8080)"
    echo "  --frontend-port PORT      Puerto del frontend (default: 3000)"
    echo "  --name-jar-file FILE      Nombre del archivo JAR (default: taskmanager.jar)"
    echo "  bash                      Iniciar sesión de bash interactiva"
    echo "  help                      Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 --start-all"
    echo "  $0 --start-backend --backend-port 8080"
    echo "  $0 --stop"
    echo "  $0 bash"
}

# Cargar configuración de variables de entorno
if [ -f "/app/env-setup.sh" ]; then
    log "Cargando configuración de variables de entorno desde /app/env-setup.sh..."
    source /app/env-setup.sh
else
    log_warning "No se encontró el archivo /app/env-setup.sh. Usando valores por defecto."
    export NAME_JAR_FILE="taskmanager.jar"
    export BACKEND_PORT="8080"
    export FRONTEND_PORT="3000"
    export PROJECT_ROOT="/app/task-manager"
fi

# Función para preparar el entorno si es necesario
prepare_if_needed() {
    if [ ! -d "/app/task-manager" ]; then
        log "El entorno no está preparado. Ejecutando prepare_environment.sh..."
        if [ -f "/app/prepare_environment.sh" ]; then
            bash /app/prepare_environment.sh
        else
            log_error "Error: No se encontró /app/prepare_environment.sh"
            exit 1
        fi
    else
        log_info "El entorno ya está preparado."
    fi
}

# Función para iniciar la aplicación
start_application() {
    local start_mode=$1
    local backend_port=${2:-$BACKEND_PORT}
    local frontend_port=${3:-$FRONTEND_PORT}
    local jar_file=${4:-$NAME_JAR_FILE}
    
    prepare_if_needed
    
    log "Iniciando Task Manager..."
    log_info "Modo: $start_mode"
    log_info "Backend port: $backend_port"
    log_info "Frontend port: $frontend_port"
    log_info "JAR file: $jar_file"
    
    cd /app/task-manager/bin
    
    case "$start_mode" in
        "all")
            python3 start.py --start-all \
                --project-root /app/task-manager \
                --backend-port "$backend_port" \
                --frontend-port "$frontend_port" \
                --name-jar-file "$jar_file"
            ;;
        "backend")
            python3 start.py --start-backend \
                --project-root /app/task-manager \
                --backend-port "$backend_port" \
                --name-jar-file "$jar_file"
            ;;
        "frontend")
            python3 start.py --start-frontend \
                --project-root /app/task-manager \
                --frontend-port "$frontend_port"
            ;;
        *)
            log_error "Modo de inicio desconocido: $start_mode"
            exit 1
            ;;
    esac
    
    # Mantener el contenedor corriendo
    log "✅ Aplicación iniciada. Manteniendo contenedor activo..."
    tail -f /dev/null
}

# Función para detener la aplicación
stop_application() {
    local stop_mode=$1
    local backend_port=${2:-$BACKEND_PORT}
    local frontend_port=${3:-$FRONTEND_PORT}
    
    log "Deteniendo Task Manager..."
    log_info "Modo: $stop_mode"
    
    if [ ! -d "/app/task-manager/bin" ]; then
        log_error "Error: La aplicación no está instalada en /app/task-manager"
        exit 1
    fi
    
    cd /app/task-manager/bin
    
    case "$stop_mode" in
        "all")
            python3 stop.py \
                --backend-port "$backend_port" \
                --frontend-port "$frontend_port"
            ;;
        "backend")
            python3 stop.py --stop-backend \
                --backend-port "$backend_port"
            ;;
        "frontend")
            python3 stop.py --stop-frontend \
                --frontend-port "$frontend_port"
            ;;
        *)
            log_error "Modo de detención desconocido: $stop_mode"
            exit 1
            ;;
    esac
    
    log "✅ Aplicación detenida correctamente"
}

# Parsear argumentos
ACTION="start"
MODE="all"
CUSTOM_BACKEND_PORT=""
CUSTOM_FRONTEND_PORT=""
CUSTOM_JAR_FILE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --start-all)
            ACTION="start"
            MODE="all"
            shift
            ;;
        --start-backend)
            ACTION="start"
            MODE="backend"
            shift
            ;;
        --start-frontend)
            ACTION="start"
            MODE="frontend"
            shift
            ;;
        --stop)
            ACTION="stop"
            MODE="all"
            shift
            ;;
        --stop-backend)
            ACTION="stop"
            MODE="backend"
            shift
            ;;
        --stop-frontend)
            ACTION="stop"
            MODE="frontend"
            shift
            ;;
        --backend-port)
            CUSTOM_BACKEND_PORT="$2"
            shift 2
            ;;
        --frontend-port)
            CUSTOM_FRONTEND_PORT="$2"
            shift 2
            ;;
        --name-jar-file)
            CUSTOM_JAR_FILE="$2"
            shift 2
            ;;
        bash)
            log "Iniciando sesión de bash..."
            exec bash
            ;;
        help|--help|-h)
            show_help
            exit 0
            ;;
        *)
            log_warning "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Usar valores personalizados si se proporcionan, de lo contrario usar los por defecto
BACKEND_PORT=${CUSTOM_BACKEND_PORT:-$BACKEND_PORT}
FRONTEND_PORT=${CUSTOM_FRONTEND_PORT:-$FRONTEND_PORT}
NAME_JAR_FILE=${CUSTOM_JAR_FILE:-$NAME_JAR_FILE}

# Ejecutar la acción correspondiente
case "$ACTION" in
    start)
        start_application "$MODE" "$BACKEND_PORT" "$FRONTEND_PORT" "$NAME_JAR_FILE"
        ;;
    stop)
        stop_application "$MODE" "$BACKEND_PORT" "$FRONTEND_PORT"
        ;;
    *)
        log_error "Acción desconocida: $ACTION"
        show_help
        exit 1
        ;;
esac

exit 0
