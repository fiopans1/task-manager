Task Manager - Guía de Despliegue con Docker

Esta guía explica cómo desplegar la aplicación Task Manager utilizando Docker con compilación integrada.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Proceso de Despliegue Integrado](#proceso-de-despliegue-integrado)
3. [Opciones de Configuración](#opciones-de-configuración)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Resolución de Problemas](#resolución-de-problemas)

## 🔧 Requisitos Previos

- Docker instalado y funcionando
- Al menos 4GB de RAM disponible para el build
- Al menos 5GB de espacio en disco
- Puertos disponibles: 8080 (backend) y 3000 (frontend)

## � Proceso de Despliegue Integrado

La nueva imagen de Docker incluye compilación integrada multi-stage. No necesitas compilar el proyecto por separado.

### Construcción Básica

```bash
# Construcción simple para AMD64 (servidores típicos)
docker build -f docker/Dockerfile.deployment -t fiopans1/taskmanager:latest .
```

### Usando el Script de Ayuda

El proyecto incluye un script `docker/build.sh` que facilita la construcción:

```bash
# Dar permisos de ejecución
chmod +x docker/build.sh

# Construcción básica
./docker/build.sh

# Construcción para arquitectura específica
./docker/build.sh --platform linux/amd64

# Construcción para ARM64 (Mac M1/M2, Raspberry Pi 4)
./docker/build.sh --platform linux/arm64

# Construcción multi-plataforma
./docker/build.sh --multi

# Construcción y push a Docker Hub
./docker/build.sh --platform linux/amd64 --push --tag miusuario/taskmanager:v1.0

# Ver todas las opciones
./docker/build.sh --help
```

### Arquitecturas Soportadas

| Plataforma     | Descripción  | Uso Típico                              |
| -------------- | ------------ | --------------------------------------- |
| `linux/amd64`  | x86_64/AMD64 | Servidores, VPS, PC                     |
| `linux/arm64`  | ARM 64-bit   | Mac M1/M2, Raspberry Pi 4, AWS Graviton |
| `linux/arm/v7` | ARM 32-bit   | Raspberry Pi 3 y anteriores             |

## 🎯 Ejecutar el Contenedor

### Opción 1: Iniciar todo (backend + frontend)

```bash
docker run -d \
  --name taskmanager \
  -p 8080:8080 \
  -p 3000:3000 \
  -v taskmanager-data:/app/bd \
  fiopans1/taskmanager-deployment:latest
```

#### Opción 2: Solo backend

```bash
docker run -d \
  --name taskmanager-backend \
  -p 8080:8080 \
  -v taskmanager-data:/app/bd \
  fiopans1/taskmanager-deployment:latest --start-backend
```

#### Opción 3: Solo frontend

```bash
docker run -d \
  --name taskmanager-frontend \
  -p 3000:3000 \
  fiopans1/taskmanager-deployment:latest --start-frontend
```

## ⚙️ Opciones de Configuración

### Variables de Entorno

Puedes configurar la aplicación usando variables de entorno:

```bash
docker run -d \
  -e BACKEND_PORT=9090 \
  -e FRONTEND_PORT=4000 \
  -p 9090:9090 \
  -p 4000:4000 \
  fiopans1/taskmanager-deployment:latest
```

### Variables Disponibles

| Variable        | Descripción                  | Valor por Defecto   |
| --------------- | ---------------------------- | ------------------- |
| `BACKEND_PORT`  | Puerto del backend           | `8080`              |
| `FRONTEND_PORT` | Puerto del frontend          | `3000`              |
| `PROJECT_ROOT`  | Directorio raíz del proyecto | `/app/task-manager` |

### Argumentos del Contenedor

| Argumento              | Descripción                              |
| ---------------------- | ---------------------------------------- |
| `--start-all`          | Iniciar backend y frontend (por defecto) |
| `--start-backend`      | Iniciar solo el backend                  |
| `--start-frontend`     | Iniciar solo el frontend                 |
| `--backend-port PORT`  | Especificar puerto del backend           |
| `--frontend-port PORT` | Especificar puerto del frontend          |
| `bash`                 | Iniciar sesión bash interactiva          |
| `help`                 | Mostrar ayuda                            |

## 📚 Ejemplos de Uso

### Ejemplo 1: Despliegue completo con puertos personalizados

```bash
docker run -d \
  --name taskmanager \
  -p 9090:9090 \
  -p 4000:4000 \
  -v taskmanager-data:/app/bd \
  fiopans1/taskmanager-deployment:latest \
  --backend-port 9090 \
  --frontend-port 4000
```

### Ejemplo 2: Usar Docker Compose

Crea un archivo `docker-compose.yml`:

```yaml
version: "3.8"

services:
  taskmanager:
    image: fiopans1/taskmanager-deployment:latest
    container_name: taskmanager
    ports:
      - "8080:8080"
      - "3000:3000"
    volumes:
      - taskmanager-data:/app/bd
    environment:
      - BACKEND_PORT=8080
      - FRONTEND_PORT=3000
    restart: unless-stopped

volumes:
  taskmanager-data:
```

Luego ejecuta:

```bash
docker-compose up -d
```

### Ejemplo 3: Debugging interactivo

```bash
docker run -it \
  -p 8080:8080 \
  -p 3000:3000 \
  fiopans1/taskmanager-deployment:latest bash
```

Dentro del contenedor:

```bash
# Preparar el entorno
/app/prepare_environment.sh

# Iniciar manualmente
cd /app/task-manager/bin
python3 start.py --start-all --project-root /app/task-manager
```

### Ejemplo 4: Ver logs del contenedor

```bash
# Ver logs en tiempo real
docker logs -f taskmanager

# Ver últimas 100 líneas
docker logs --tail 100 taskmanager
```

### Ejemplo 5: Detener y reiniciar

```bash
# Detener el contenedor
docker stop taskmanager

# Reiniciar el contenedor
docker start taskmanager

# Reiniciar completamente
docker restart taskmanager
```

## 🔍 Verificación del Despliegue

### Comprobar que los servicios están corriendo

```bash
# Backend health check
curl http://localhost:8080/health

# Frontend
curl http://localhost:3000
```

### Verificar puertos en uso

```bash
# Dentro del contenedor
docker exec taskmanager lsof -i :8080
docker exec taskmanager lsof -i :3000
```

### Inspeccionar el contenedor

```bash
# Ver información del contenedor
docker inspect taskmanager

# Ver procesos en ejecución
docker top taskmanager
```

## 🐛 Resolución de Problemas

### Problema: El contenedor se detiene inmediatamente

**Solución**: Verifica los logs para identificar el error:

```bash
docker logs taskmanager
```

### Problema: Puerto ya en uso

**Solución**: Usa puertos diferentes:

```bash
docker run -d \
  -p 8081:8080 \
  -p 3001:3000 \
  fiopans1/taskmanager-deployment:latest
```

O detén el proceso que está usando el puerto:

```bash
# Linux/Mac
lsof -ti:8080 | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /F /PID <PID>
```

### Problema: Error al extraer TaskManager.zip

**Solución**: Verifica que el archivo ZIP sea válido:

```bash
unzip -t TaskManager.zip
```

Si el archivo está corrupto, vuelve a generar la compilación.

### Problema: Backend no responde

**Solución**: Verifica que Java esté correctamente configurado:

```bash
docker exec taskmanager java -version
docker exec taskmanager ps aux | grep java
```

### Problema: Frontend no carga

**Solución**: Verifica que Caddy esté corriendo:

```bash
docker exec taskmanager ps aux | grep caddy
docker exec taskmanager /app/task-manager/lib/caddy version
```

### Problema: Permisos insuficientes

**Solución**: Asegúrate de que los scripts tengan permisos de ejecución:

```bash
docker exec taskmanager ls -la /app/task-manager/bin/
docker exec taskmanager chmod +x /app/task-manager/bin/*.py
docker exec taskmanager chmod +x /app/task-manager/lib/caddy
```

## 📊 Monitoreo

### Ver uso de recursos

```bash
# Estadísticas en tiempo real
docker stats taskmanager

# Uso de disco
docker system df
```

### Gestión de volúmenes

```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect taskmanager-data

# Hacer backup del volumen
docker run --rm -v taskmanager-data:/data -v $(pwd):/backup \
  busybox tar czf /backup/taskmanager-backup.tar.gz /data
```

## 🧹 Limpieza

### Detener y eliminar el contenedor

```bash
docker stop taskmanager
docker rm taskmanager
```

### Eliminar la imagen

```bash
docker rmi fiopans1/taskmanager-deployment:latest
```

### Eliminar volúmenes (¡CUIDADO! Se perderán los datos)

```bash
docker volume rm taskmanager-data
```

### Limpieza completa

```bash
# Eliminar todo (contenedores, imágenes, volúmenes)
docker stop taskmanager
docker rm taskmanager
docker rmi fiopans1/taskmanager-deployment:latest
docker volume rm taskmanager-data
```

## 📝 Notas Adicionales

- El volumen `/app/bd` se utiliza para persistir datos de la base de datos
- Los logs de la aplicación se encuentran dentro del contenedor en `/app/task-manager/logs/`
- Para producción, se recomienda usar un proxy reverso (nginx, Traefik) delante del contenedor
- Considera usar Docker secrets o variables de entorno para información sensible

## 🔗 Enlaces Útiles

- [Documentación de Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Repositorio del proyecto](https://github.com/fiopans1/task-manager)

## 📄 Licencia

Este proyecto está licenciado bajo GNU Affero General Public License v3.0. Ver el archivo [LICENSE](../LICENSE) para más detalles.
