# User guide

## Authentication and access

Task Manager supports two main access models:

- **local authentication** with username and password,
- **OAuth2 authentication** through Google, GitHub, or Authentik when enabled by the system.

After a successful sign-in, the backend creates a secure cookie-based session:

- one `HttpOnly` access cookie,
- one `HttpOnly` refresh cookie,
- one browser-readable CSRF cookie used to protect write operations.

The frontend does not need to read the access token from JavaScript. Instead, it asks for the current session and automatically attaches CSRF protection when it creates, edits, or deletes data.

### What changes for the user

- The session can refresh automatically while the refresh cookie remains valid.
- If the session expires, the application asks you to authenticate again.
- When you sign out, the system invalidates the active session and clears the authentication cookies.

## What you can do as a user

### Main dashboard

The dashboard summarizes the general state of your work. It is the best entry point to review pending tasks, recent activity, and quick access to the main sections.

### Task management

Tasks are the core of the application. Each task can include:

- name or title,
- priority,
- status,
- start and end dates,
- comments and action history,
- relationship with a list or a team.

Recommended workflow:

1. Create the task.
2. Set priority and status.
3. Add enough context for the person who will execute it.
4. Update the status as the work progresses.

### Lists

Lists help organize groups of tasks by project, area, or context. They are especially useful when you need to review related work without mixing it with the rest of the personal or team backlog.

### Calendar

The calendar view lets you plan work around specific dates. It is useful for weekly tracking, reviews, deliveries, or any task that must be understood in a time-based context.

### Teams

Teams provide structured collaboration:

- inviting users,
- sharing task visibility,
- assigning responsibilities,
- separating administration permissions from regular participation.

## Roles and permissions

### System role

- **BASIC**: standard user with normal access to the application.
- **ADMIN**: access to global administration features.

### Team role

Teams have their own roles to separate team administration from day-to-day operational work.

## Administration features

If your account has administrator permissions, you can work with:

- user management,
- system messages,
- administrative settings and feature flags.

These capabilities are meant for operations and support rather than for the everyday workflow of a standard user.

## Good usage practices

- Keep priorities and statuses up to date.
- Use lists when a set of tasks shares the same purpose.
- Schedule events when the date is as important as the content.
- Separate personal work from team work to preserve visibility.
- If you use OAuth2, make sure the browser accepts the redirects and cookies of the environment you are using.
