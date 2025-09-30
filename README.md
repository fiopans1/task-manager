# task-manager

This is my personal task manager application

## 🚀 Quick Start with Docker

### Compilation

```bash
# Build compilation image
docker build -f docker/Dockerfile.build -t fiopans1/taskmanager-compilation:latest .

# Compile the project
docker run -v $(pwd):/output fiopans1/taskmanager-compilation:latest compile
```

### Deployment

```bash
# Build deployment image
docker build -f docker/Dockerfile.deployment -t fiopans1/taskmanager-deployment:latest .

# Run the application
docker run -d -p 8080:8080 -p 3000:3000 --name taskmanager fiopans1/taskmanager-deployment:latest
```

For detailed deployment instructions, see [docker/DEPLOYMENT_README.md](docker/DEPLOYMENT_README.md)

## 📖 Manual Compilation and Deployment

### Lanzar el deploy:

```bash
python3 compile.py --action deploy --name-jar-file taskmanager-0.0.1-Alpha.jar --name-final-file TaskManager
```

### Ejecutar el start:

```bash
python3 start.py --start-all --name-jar-file taskmanager-0.0.1-Alpha.jar
```

### Detener la aplicación:

```bash
python3 stop.py
```

## 🔐 Generar las claves:

### Generar clave privada

```bash
openssl genrsa -out src/main/resources/keys/private_key.pem 2048
```

### Generar clave pública

```bash
openssl rsa -in src/main/resources/keys/private_key.pem -pubout -out src/main/resources/keys/public_key.pem
```

## 📦 Docker Images

- **Compilation Image**: `fiopans1/taskmanager-compilation:latest`
  - Used to build the application and generate `TaskManager.zip`
  
- **Deployment Image**: `fiopans1/taskmanager-deployment:latest`
  - Used to run the application with all services

## License

Copyright (c) 2025 Diego Suárez Ramos (@fiopans1)

This program is free software: you can redistribute it and/or modify it under the terms of the **GNU Affero General Public License v3.0** as published by the Free Software Foundation.

This means that if you use this software over a network, you must provide the source code of your modified version to the users of that service. For more details, see the full license text.

A copy of the license is included in the [LICENSE](LICENSE) file and is also available at [https://www.gnu.org/licenses/agpl-3.0.html](https://www.gnu.org/licenses/agpl-3.0.html).
