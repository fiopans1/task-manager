# Función para setear variable solo si no existe
set_default() {
    local var_name=$1
    local default_value=$2
    
    if [ -z "${!var_name}" ]; then
        export $var_name="$default_value"
        echo "   $var_name: $default_value (default)"
    else
        echo "   $var_name: ${!var_name} (existing)"
    fi
}

echo "🔧 Configurando variables por defecto..."


set_default "ACTION" "deploy"
set_default "NAME_JAR_FILE" "taskmanager-0.0.1-Alpha.jar"
set_default "NAME_FINAL_FILE" "TaskManager"
set_default "PLATFORM" "mac"
set_default "VERSION" "1.0.0"
set_default "ARCHITECTURE" "arm64"
set_default "SPECIFY_SPECIFICATIONS" "false"
set_default "CADDY_VERSION" "v2.7.6"