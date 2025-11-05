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

# Verificar que PROJECT_ROOT esté definido
if [ -z "$PROJECT_ROOT" ]; then
    log_error "Error: La variable PROJECT_ROOT no está definida"
    exit 1
fi

log_info "Usando PROJECT_ROOT: $PROJECT_ROOT"

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
    if [ ! -d "$PROJECT_ROOT" ]; then
        log_error "Error: No se encontró el directorio $PROJECT_ROOT después de la extracción"
        exit 1
    fi

    log "✓ Estructura de directorios verificada"

    # Dar permisos de ejecución a los scripts
    log "Configurando permisos de ejecución..."

    if [ -f "$PROJECT_ROOT/bin/start.py" ]; then
        chmod +x "$PROJECT_ROOT/bin/start.py"
        log "✓ Permisos configurados para start.py"
    else
        log_warning "No se encontró $PROJECT_ROOT/bin/start.py"
    fi

    if [ -f "$PROJECT_ROOT/bin/stop.py" ]; then
        chmod +x "$PROJECT_ROOT/bin/stop.py"
        log "✓ Permisos configurados para stop.py"
    else
        log_warning "No se encontró $PROJECT_ROOT/bin/stop.py"
    fi

    if [ -f "$PROJECT_ROOT/lib/caddy" ]; then
        chmod +x "$PROJECT_ROOT/lib/caddy"
        log "✓ Permisos configurados para caddy"
    else
        log_warning "No se encontró $PROJECT_ROOT/lib/caddy"
    fi

    # Verificar estructura de directorios
    log_info "Estructura de directorios:"
    ls -la "$PROJECT_ROOT/" || true

    log_info "Contenido de $PROJECT_ROOT/lib:"
    ls -la "$PROJECT_ROOT/lib/" || true

    log_info "Contenido de $PROJECT_ROOT/bin:"
    ls -la "$PROJECT_ROOT/bin/" || true

    log "✅ Entorno preparado correctamente"
}

# Función para copiar archivos de configuración desde el volumen compartido
copy_config_files() {
    local volume_dir="/files_to_copy"
    
    log "Verificando archivos de configuración personalizados..."

    # Verificar si el directorio del volumen existe
    if [ ! -d "$volume_dir" ]; then
        log_warning "Directorio $volume_dir no encontrado. Usando configuración por defecto."
        return 0
    fi

    log_info "Directorio de configuración personalizada encontrado: $volume_dir"

    # Copiar application.properties si existe
    if [ -f "$volume_dir/application.properties" ]; then
        log_info "Copiando application.properties personalizado..."
        cp "$volume_dir/application.properties" "$PROJECT_ROOT/config/application.properties"
        log "✓ application.properties actualizado"
    else
        log_info "No se encontró application.properties personalizado. Usando el existente."
    fi

    # Copiar Caddyfile si existe
    if [ -f "$volume_dir/Caddyfile" ]; then
        log_info "Copiando Caddyfile personalizado..."
        cp "$volume_dir/Caddyfile" "$PROJECT_ROOT/config/Caddyfile"
        log "✓ Caddyfile actualizado"
    else
        log_info "No se encontró Caddyfile personalizado. Usando el existente."
    fi

    # Copiar log-backend-config.xml si existe
    if [ -f "$volume_dir/log-backend-config.xml" ]; then
        log_info "Copiando log-backend-config.xml personalizado..."
        cp "$volume_dir/log-backend-config.xml" "$PROJECT_ROOT/config/log-backend-config.xml"
        log "✓ log-backend-config.xml actualizado"
    else
        log_info "No se encontró log-backend-config.xml personalizado. Usando el existente."
    fi

    # Copiar config.js si existe
    if [ -f "$volume_dir/config.js" ]; then
        log_info "Copiando config.js personalizado..."
        # Verificar que el directorio frontend existe
        if [ -d "$PROJECT_ROOT/lib/frontend" ]; then
            cp "$volume_dir/config.js" "$PROJECT_ROOT/lib/frontend/config.js"
            log "✓ config.js actualizado"
        else
            log_warning "Directorio $PROJECT_ROOT/lib/frontend no encontrado. No se puede copiar config.js"
        fi
    else
        log_info "No se encontró config.js personalizado. Usando el existente."
    fi

    log "✅ Verificación de archivos de configuración completada"
}

# Ejecutar las funciones principales
prepare_environment
copy_config_files