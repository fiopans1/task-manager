# Despliegue

## Opciones disponibles

Task Manager contempla dos rutas principales:

1. **Empaquetado clásico** mediante `scripts/compile.py`
2. **Despliegue Docker** mediante `docker/Dockerfile.deployment` y `docker/build.sh`

## Empaquetado del proyecto

```bash
cd /home/runner/work/task-manager/task-manager/scripts
python3 compile.py --action deploy
```

El proceso prepara backend, frontend, plantillas de configuración y artefacto final de distribución.

## Docker

Build recomendado:

```bash
docker build -f docker/Dockerfile.deployment -t fiopans1/taskmanager:latest /home/runner/work/task-manager/task-manager
```

Script auxiliar:

```bash
cd /home/runner/work/task-manager/task-manager
./docker/build.sh
```

## Qué revisar antes de publicar

- versión de Java compatible con backend,
- configuración runtime del frontend,
- puertos expuestos para backend y frontend,
- persistencia de datos SQLite o volumen equivalente,
- claves JWT y credenciales OAuth2 fuera del control de versiones.

## Verificación básica

- backend accesible y healthy,
- frontend sirviendo la SPA,
- `config.js` apuntando al backend correcto,
- login local y, si aplica, login OAuth2 funcionando.

## Referencias detalladas

- Guía Docker completa: [DEPLOYMENT.md](/DEPLOYMENT)
- Configuración del sistema: [CONFIGURATION.md](/CONFIGURATION)
- Documentación técnica: [TECHNICAL.md](/TECHNICAL)
