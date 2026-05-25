# Despliegue

## Opciones de publicación

Task Manager puede desplegarse de dos formas principales:

1. **empaquetado clásico**, generando un artefacto de despliegue con scripts del repositorio,
2. **contenedores Docker**, usando la imagen de despliegue multi-stage.

## Empaquetado clásico

```bash
cd scripts
python3 compile.py --action deploy
```

El proceso genera un paquete con:

- backend compilado,
- frontend construido,
- plantillas de configuración,
- runtime necesario para ejecutar la aplicación.

Después del build:

1. descomprime el artefacto,
2. ajusta la configuración,
3. inicia los servicios con los scripts incluidos.

## Docker

### Build

```bash
docker build -f docker/Dockerfile.deployment -t fiopans1/taskmanager:latest .
```

### Ejecución

```bash
docker run -d \
  --name taskmanager \
  -p 8080:8080 \
  -p 3000:3000 \
  fiopans1/taskmanager:latest
```

## Checklist de producción

Antes de publicar en un entorno real, revisa:

- URLs públicas correctas para frontend y backend,
- claves JWT fuera del control de versiones,
- configuración de OAuth2 alineada con los callbacks reales,
- `taskmanager.security.cors.allowed-origins` ajustado a los dominios reales del frontend,
- `taskmanager.security.cookies.secure`, `sameSite` y `domain` alineados con HTTP/HTTPS y subdominios,
- persistencia de datos y copias de seguridad,
- puertos y proxy reverso adecuados,
- logs y monitorización disponibles.

## Qué cambia con cookies HttpOnly y CSRF

El despliegue debe asumir que la autenticación depende de credenciales de navegador y no de un token gestionado por JavaScript.

- El frontend debe llamar al backend con credenciales.
- El backend debe permitir credenciales CORS desde los orígenes autorizados.
- Las cookies de acceso y refresh deben enviarse y borrarse correctamente según `path`, `domain`, `secure` y `SameSite`.
- Las operaciones de escritura necesitan el token CSRF emitido en `/api/session/csrf`.

## Verificaciones mínimas tras el despliegue

- El frontend responde en el puerto esperado.
- El backend responde en el puerto esperado.
- La autenticación local funciona.
- OAuth2 funciona si está habilitado.
- El refresh de sesión funciona sin exponer tokens en el navegador.
- Un `POST` autenticado falla sin CSRF y funciona con el flujo normal del frontend.
- Las tareas, listas y equipos pueden crearse y consultarse.

## Cuándo elegir cada opción

- **Empaquetado clásico** si necesitas una distribución autocontenida basada en los scripts del proyecto.
- **Docker** si quieres homogeneidad entre entornos y una estrategia operativa más fácil de automatizar.
