import { defineConfig } from 'vitepress'

const spanishSidebar = [
  {
    text: 'Documentación',
    items: [
      { text: 'Inicio', link: '/es/' },
      { text: 'Primeros pasos', link: '/es/primeros-pasos' },
      { text: 'Guía de usuario', link: '/es/guia-usuario' },
      { text: 'Guía de desarrollo', link: '/es/guia-desarrollo' },
      { text: 'Arquitectura', link: '/es/arquitectura' },
      { text: 'Despliegue', link: '/es/despliegue' }
    ]
  }
]

const englishSidebar = [
  {
    text: 'Documentation',
    items: [
      { text: 'Home', link: '/en/' },
      { text: 'Getting started', link: '/en/getting-started' },
      { text: 'User guide', link: '/en/user-guide' },
      { text: 'Developer guide', link: '/en/developer-guide' },
      { text: 'Architecture', link: '/en/architecture' },
      { text: 'Deployment', link: '/en/deployment' }
    ]
  }
]

export default defineConfig({
  title: 'Task Manager',
  description: 'Documentation for end users, administrators, and development teams.',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['meta', { name: 'theme-color', content: '#0f172a' }],
    ['meta', { property: 'og:title', content: 'Task Manager' }],
    ['meta', { property: 'og:description', content: 'Documentation for end users, administrators, and development teams.' }]
  ],
  locales: {
    root: {
      label: 'Español',
      lang: 'es-ES',
      title: 'Task Manager',
      description: 'Redirección al portal en español.',
      themeConfig: {
        logo: '/logo.png',
        siteTitle: 'Task Manager',
        sidebar: [],
        footer: {
          message: 'Task Manager Documentation',
          copyright: '© 2026 Diego Suárez Ramos'
        }
      }
    },
    es: {
      label: 'Español',
      lang: 'es-ES',
      title: 'Task Manager',
      description: 'Documentación para usuarios finales, administradores y equipos de desarrollo.',
      link: '/es/',
      themeConfig: {
        logo: '/logo.png',
        siteTitle: 'Task Manager',
        nav: [
          { text: 'Inicio', link: '/es/' },
          { text: 'Primeros pasos', link: '/es/primeros-pasos' },
          { text: 'Usuarios', link: '/es/guia-usuario' },
          { text: 'Desarrollo', link: '/es/guia-desarrollo' },
          { text: 'Arquitectura', link: '/es/arquitectura' },
          { text: 'Despliegue', link: '/es/despliegue' }
        ],
        sidebar: spanishSidebar,
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
          message: 'Documentación oficial de Task Manager',
          copyright: '© 2026 Diego Suárez Ramos'
        },
        docFooter: {
          prev: 'Página anterior',
          next: 'Página siguiente'
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'Task Manager',
      description: 'Documentation for end users, administrators, and development teams.',
      link: '/en/',
      themeConfig: {
        logo: '/logo.png',
        siteTitle: 'Task Manager',
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Getting started', link: '/en/getting-started' },
          { text: 'Users', link: '/en/user-guide' },
          { text: 'Development', link: '/en/developer-guide' },
          { text: 'Architecture', link: '/en/architecture' },
          { text: 'Deployment', link: '/en/deployment' }
        ],
        sidebar: englishSidebar,
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
          message: 'Official Task Manager documentation',
          copyright: '© 2026 Diego Suárez Ramos'
        },
        docFooter: {
          prev: 'Previous page',
          next: 'Next page'
        }
      }
    }
  }
})
