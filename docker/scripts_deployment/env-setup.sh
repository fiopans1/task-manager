#!/bin/bash
# Función para setear variable solo si no existe
set_default() {
    local var_name=$1
    local default_value=$2
    
    if [ -z "${!var_name}" ]; then
        export "${var_name}=${default_value}"
        echo "   $var_name: $default_value (default)"
    else
        echo "   $var_name: ${!var_name} (existing)"
    fi
}

echo "🔧 Configurando variables por defecto..."


# Variables por defecto
