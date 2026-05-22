---
layout: home

title: Task Manager Docs
hero:
  name: Task Manager
  text: Documentación moderna para instalar, configurar y operar la aplicación
  tagline: Portal creado con VitePress y alimentado por los markdowns existentes en `/docs`.
  image:
    src: /logo.png
    alt: Logo de Task Manager
  actions:
    - theme: brand
      text: Empezar ahora
      link: /guia-rapida
    - theme: alt
      text: Ver arquitectura
      link: /arquitectura
    - theme: alt
      text: Referencia completa
      link: /DOCUMENTATION
features:
  - title: Onboarding rápido
    details: Empieza con una ruta clara para desarrollo, configuración y despliegue sin perderte entre documentos largos.
  - title: Fuente única
    details: Mantiene como base la documentación original del proyecto y la organiza con navegación, búsqueda local y estructura moderna.
  - title: Lista para producción
    details: Resume los puntos clave para ejecutar el backend, el frontend, la configuración runtime y el despliegue con Docker.
---

## Qué encontrarás aquí

<div class="tm-grid">
  <div>
    <h3>Guía rápida</h3>
    <p>Prerequisitos, puesta en marcha local y flujo recomendado para contribuir o probar la aplicación.</p>
  </div>
  <div>
    <h3>Arquitectura</h3>
    <p>Vista de alto nivel del backend Spring Boot, el frontend React/Vite, la configuración runtime y el empaquetado.</p>
  </div>
  <div>
    <h3>Configuración</h3>
    <p>Resumen operativo de <code>application.properties</code>, <code>config.js</code> y Caddy para distintos entornos.</p>
  </div>
  <div>
    <h3>Referencia completa</h3>
    <p>Acceso directo a los documentos extensos en español e inglés ya presentes en el repositorio.</p>
  </div>
</div>

## Ruta recomendada

1. Lee la [guía rápida](/guia-rapida).
2. Revisa la [arquitectura](/arquitectura) para entender cómo encajan backend, frontend y despliegue.
3. Usa la [configuración rápida](/configuracion-rapida) antes de levantar la app en local o en producción.
4. Consulta la [referencia](/referencia) cuando necesites el detalle completo por módulo o funcionalidad.

<div class="tm-callout">
  <strong>Estado actual del proyecto</strong>
  <p>La base documental original sigue siendo la carpeta <code>/docs</code>, pero este portal añade navegación, búsqueda y una capa curada con la información más útil para empezar. Para el frontend actual, los comandos activos del repositorio usan <strong>Vite + pnpm</strong>.</p>
</div>

## Cobertura documental

- **Producto y uso diario:** [DOCUMENTATION.md](/DOCUMENTATION)
- **Arquitectura y estructura interna:** [TECHNICAL.md](/TECHNICAL)
- **Configuración de entornos:** [CONFIGURATION.md](/CONFIGURATION)
- **Despliegue con Docker:** [DEPLOYMENT.md](/DEPLOYMENT)
- **Versión en inglés:** [DOCUMENTATION_EN.md](/DOCUMENTATION_EN) y [TECHNICAL_EN.md](/TECHNICAL_EN)
