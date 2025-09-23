# task-manager

This is my personal task manager application

## Lanzar el deploy:

python3 compile.py --action deploy --name-jar-file taskmanager-0.0.1-Alpha.jar --name-final-file TaskManager

## Ejecutar el start:

python3 start.py --start-all --name-jar-file taskmanager-0.0.1-Alpha.jar

kill -9 $(lsof -ti:8080)

./caddy run --config ../config/Caddyfile --adapter caddyfile 
## Generar las claves:

### Generar clave privada

openssl genrsa -out src/main/resources/keys/private_key.pem 2048

### Generar clave pública

openssl rsa -in src/main/resources/keys/private_key.pem -pubout -out src/main/resources/keys/public_key.pem


#Compilar con docker:

docker build -f /scripts/Dockerfile.build -t fiopans1/taskmanager-compilation:alpha .

docker run  -v <rutalocal>:/output fiopans1/taskmanager-compilation:alpha

## License

Copyright (c) 2025 Diego Suárez Ramos (@fiopans1)

This program is free software: you can redistribute it and/or modify it under the terms of the **GNU Affero General Public License v3.0** as published by the Free Software Foundation.

This means that if you use this software over a network, you must provide the source code of your modified version to the users of that service. For more details, see the full license text.

A copy of the license is included in the [LICENSE](LICENSE) file and is also available at [https://www.gnu.org/licenses/agpl-3.0.html](https://www.gnu.org/licenses/agpl-3.0.html).
