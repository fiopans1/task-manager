---
layout: home

title: Task Manager
hero:
  name: Task Manager
  text: Documentation for end users, administrators, and development teams
  tagline: Manage tasks, lists, events, and teams from a single web application powered by a Spring Boot backend and a React frontend.
  image:
    src: /logo.png
    alt: Task Manager logo
  actions:
    - theme: brand
      text: Get started
      link: /en/getting-started
    - theme: alt
      text: User guide
      link: /en/user-guide
    - theme: alt
      text: Developer guide
      link: /en/developer-guide
features:
  - title: Clearer daily work
    details: Create tasks, group them into lists, schedule events, and collaborate in teams from an interface designed for desktop and mobile use.
  - title: Administration and security
    details: Manage users, permissions, system messages, and local or OAuth2 authentication from a centralized configuration model.
  - title: Predictable operations
    details: Configure the backend with Spring Boot, the frontend through `config.js`, and deploy with packaging scripts or Docker.
---

## What Task Manager solves

Task Manager is designed to centralize day-to-day work operations in one place. The application covers four common needs:

- **planning work** through tasks with priority, status, and dates,
- **organizing context** with custom lists,
- **coordinating teams** with roles and assignments,
- **operating securely** with JWT, OAuth2, and permission controls.

## Who this documentation is for

### End user

You will find how to sign up, sign in, create tasks, work with lists, collaborate with teams, and understand what each role is allowed to do.

### Administrator

You will find how to enable OAuth2 providers, review permissions, manage users, and prepare the application for production use.

### Developer

You will find how to run the project locally, where each technical responsibility lives, how runtime frontend configuration works, and how to package or deploy the application.

## Recommended reading order

1. **[Getting started](/en/getting-started)** to prepare the environment and understand the basic workflow.
2. **[User guide](/en/user-guide)** to learn the day-to-day operation of the application.
3. **[Developer guide](/en/developer-guide)** for local development, builds, and maintenance.
4. **[Architecture](/en/architecture)** to understand how frontend, backend, and security fit together.
5. **[Deployment](/en/deployment)** for local packaging or Docker-based publication.
