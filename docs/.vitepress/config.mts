import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Task Manager',
  description: 'Portal de documentación moderno para instalar, configurar y operar Task Manager.',
  lang: 'es-ES',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['meta', { name: 'theme-color', content: '#0f172a' }],
    ['meta', { property: 'og:title', content: 'Task Manager Docs' }],
    ['meta', { property: 'og:description', content: 'Documentación moderna construida con VitePress y basada en /docs.' }]
  ],
  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'Task Manager Docs',
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Guía rápida', link: '/guia-rapida' },
      { text: 'Arquitectura', link: '/arquitectura' },
      { text: 'Configuración', link: '/configuracion-rapida' },
      { text: 'Despliegue', link: '/despliegue' },
      { text: 'English', link: '/en/' }
    ],
    sidebar: {
      '/': [
        {
          text: 'Primeros pasos',
          items: [
            { text: 'Inicio', link: '/' },
            { text: 'Guía rápida', link: '/guia-rapida' },
            { text: 'Arquitectura', link: '/arquitectura' },
            { text: 'Configuración rápida', link: '/configuracion-rapida' },
            { text: 'Despliegue', link: '/despliegue' },
            { text: 'Mapa de referencias', link: '/referencia' }
          ]
        },
        {
          text: 'Documentación fuente',
          items: [
            { text: 'Documentación funcional completa', link: '/DOCUMENTATION' },
            { text: 'Documentación técnica completa', link: '/TECHNICAL' },
            { text: 'Guía de configuración', link: '/CONFIGURATION' },
            { text: 'Guía de despliegue Docker', link: '/DEPLOYMENT' }
          ]
        }
      ],
      '/en/': [
        {
          text: 'English',
          items: [
            { text: 'Overview', link: '/en/' },
            { text: 'Feature & user documentation', link: '/DOCUMENTATION_EN' },
            { text: 'Technical documentation', link: '/TECHNICAL_EN' },
            { text: 'Configuration guide', link: '/CONFIGURATION' }
          ]
        }
      ]
    },
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/fiopans1/task-manager' }
    ],
    outline: {
      level: [2, 3]
    },
    footer: {
      message: 'Documentación generada con VitePress a partir de los markdowns de `/docs`.',
      copyright: '© 2026 Diego Suárez Ramos'
    },
    docFooter: {
      prev: 'Página anterior',
      next: 'Página siguiente'
    }
  }
})
