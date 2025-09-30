#!/bin/bash
# Script para preparar el entorno de despliegue de Task Manager
# Extrae el archivo TaskManager.zip y prepara la estructura necesaria

set -e  # Salir inmediatamente si algún comando falla

# Colores para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con formato
log() {
    echo -e "${GREEN}[PREPARE]${NC} $1"
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

# Función principal para preparar el entorno
prepare_environment() {
    local zip_file="/app/TaskManager.zip"
    local extract_dir="/app"
    
    log "Iniciando preparación del entorno de despliegue..."
    
    # Verificar si el archivo ZIP existe
    if [ ! -f "$zip_file" ]; then
        log_error "Error: No se encontró el archivo $zip_file"
        exit 1
    fi
    
    log_info "Archivo ZIP encontrado: $zip_file"
    
    # Extraer el archivo ZIP
    log "Extrayendo $zip_file..."
    cd "$extract_dir"
    unzip -q "$zip_file"
    
    if [ $? -ne 0 ]; then
        log_error "Error al extraer el archivo ZIP"
        exit 1
    fi
    
    log "✓ Archivo extraído correctamente"
    
    # Verificar que la estructura esperada existe
    if [ ! -d "/app/task-manager" ]; then
        log_error "Error: No se encontró el directorio /app/task-manager después de la extracción"
        exit 1
    fi
    
    log "✓ Estructura de directorios verificada"
    
    # Dar permisos de ejecución a los scripts
    log "Configurando permisos de ejecución..."
    
    if [ -f "/app/task-manager/bin/start.py" ]; then
        chmod +x /app/task-manager/bin/start.py
        log "✓ Permisos configurados para start.py"
    else
        log_warning "No se encontró /app/task-manager/bin/start.py"
    fi
    
    if [ -f "/app/task-manager/bin/stop.py" ]; then
        chmod +x /app/task-manager/bin/stop.py
        log "✓ Permisos configurados para stop.py"
    else
        log_warning "No se encontró /app/task-manager/bin/stop.py"
    fi
    
    if [ -f "/app/task-manager/lib/caddy" ]; then
        chmod +x /app/task-manager/lib/caddy
        log "✓ Permisos configurados para caddy"
    else
        log_warning "No se encontró /app/task-manager/lib/caddy"
    fi
    
    # Verificar estructura de directorios
    log_info "Estructura de directorios:"
    ls -la /app/task-manager/ || true
    
    log_info "Contenido de /app/task-manager/lib:"
    ls -la /app/task-manager/lib/ || true
    
    log_info "Contenido de /app/task-manager/bin:"
    ls -la /app/task-manager/bin/ || true
    
    log "✅ Entorno preparado correctamente"
}

# Ejecutar la función principal
prepare_environment
