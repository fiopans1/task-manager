#!/bin/bash
# Script entrypoint.sh para el contenedor Docker de Task Manager
# Este script permite ejecutar diferentes comandos para copiar archivos y ejecutar scripts Python

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
    echo "Uso: $0 [comando] [opciones]"
    echo ""
    echo "Comandos disponibles:"
    echo "  compile                    Compila el proyecto y copia el ZIP resultante a /output"
    echo "  copy_to_output [archivo]   Copia un archivo específico al directorio /output"
    echo "  run_python [script.py]     Ejecuta un script Python específico"
    echo "  check_output               Lista los archivos en el directorio /output"
    echo "  bash                       Inicia una sesión de bash interactiva"
    echo "  help                       Muestra esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 compile"
    echo "  $0 copy_to_output /app/task-manager/TaskManager.zip"
    echo "  $0 run_python /app/task-manager/scripts/compile.py --action deploy"
    echo "  $0 check_output"
}

# Asegurarse de que el directorio de salida existe
ensure_output_dir() {
    if [ ! -d "/output" ]; then
        log_warning "El directorio /output no existe. Creándolo..."
        mkdir -p /output
    fi
}

# Función para compilar el proyecto
compile_project() {

    log "Clonando el repositorio..."
    git clone https://github.com/fiopans1/task-manager.git


    log "Iniciando compilación del proyecto..."
    
    # Ir al directorio de scripts
    cd /app/task-manager/scripts
    
    # Ejecutar el script de compilación
    log_info "Ejecutando compile.py..."
    python3 compile.py --action "${ACTION}" --name-jar-file "${NAME_JAR_FILE}" --name-final-file "${NAME_FINAL_FILE}" --platform "${PLATFORM}" --version "${VERSION}" --architecture "${ARCHITECTURE}" --specify-specifications "${SPECIFY-SPECIFICATIONS}" --caddy-version "${CADDY-VERSION}"
    
    # Verificar si se creó el archivo ZIP
    if [ -f "/app/task-manager/${NAME_FINAL_FILE}.zip" ]; then
        # Copiar el archivo a /output
        log_info "Copiando ${NAME_FINAL_FILE}.zip a /output..."
        cp /app/task-manager/${NAME_FINAL_FILE}.zip /output/

        log "Compilación completada correctamente. El archivo ${NAME_FINAL_FILE}.zip está disponible en /output"
    else
        log_error "Error: No se pudo generar el archivo ${NAME_FINAL_FILE}.zip"
        exit 1
    fi
}

# Función para copiar un archivo a /output
copy_to_output() {
    local source_file=$1
    
    if [ -z "$source_file" ]; then
        log_error "Error: Debe especificar un archivo para copiar"
        show_help
        exit 1
    fi
    
    if [ ! -f "$source_file" ]; then
        log_error "Error: El archivo $source_file no existe"
        exit 1
    fi
    
    ensure_output_dir
    
    local filename=$(basename "$source_file")
    log "Copiando $source_file a /output/$filename..."
    cp "$source_file" "/output/$filename"
    
    log "Archivo copiado correctamente"
}

# Función para ejecutar un script Python
run_python() {
    local script=$1
    shift
    
    if [ -z "$script" ]; then
        log_error "Error: Debe especificar un script Python para ejecutar"
        show_help
        exit 1
    fi
    
    if [ ! -f "$script" ]; then
        log_error "Error: El script $script no existe"
        exit 1
    fi
    
    log "Ejecutando script Python: $script $@"
    python3 "$script" "$@"
    
    log "Script ejecutado correctamente"
}

# Función para verificar el contenido del directorio /output
check_output() {
    ensure_output_dir
    
    log "Contenido del directorio /output:"
    ls -la /output
}

# Cargar configuración de variables de entorno
if [ -f "/app/env-setup.sh" ]; then
    log "Cargando configuración de variables de entorno desde /app/env-setup.sh..."
    source /app/env-setup.sh
else
    log_warning "No se encontró el archivo /app/env-setup.sh. Usando valores por defecto."
fi


# Procesar el comando pasado como argumento
case "$1" in
    compile)
        compile_project
        ;;
    copy_to_output)
        shift
        copy_to_output "$@"
        ;;
    run_python)
        shift
        run_python "$@"
        ;;
    check_output)
        check_output
        ;;
    bash)
        log "Iniciando sesión de bash..."
        exec bash
        ;;
    help)
        show_help
        ;;
    "")
        log_warning "No se especificó ningún comando"
        show_help
        exit 1
        ;;
    *)
        log_warning "Comando desconocido: $1"
        show_help
        exit 1
        ;;
esac

exit 0