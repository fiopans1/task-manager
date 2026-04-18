# Task Manager — Technical & User Documentation

> **Version:** 1.0.0  
> **License:** GNU Affero General Public License v3.0  
> **Author:** Diego Suárez Ramos (@fiopans1)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [User Guide by Feature](#2-user-guide-by-feature)
   - 2.1 [Authentication & Registration](#21-authentication--registration)
   - 2.2 [Home Dashboard](#22-home-dashboard)
   - 2.3 [Task Management](#23-task-management)
   - 2.4 [Task Detail View](#24-task-detail-view)
   - 2.5 [Task Actions & Comments](#25-task-actions--comments)
   - 2.6 [Event Calendar](#26-event-calendar)
   - 2.7 [List Management](#27-list-management)
   - 2.8 [List Detail View](#28-list-detail-view)
   - 2.9 [Team Management](#29-team-management)
   - 2.10 [Team Dashboard](#210-team-dashboard)
   - 2.11 [Team Invitations](#211-team-invitations)
   - 2.12 [Administration Panel](#212-administration-panel)
   - 2.13 [Session Management](#213-session-management)
   - 2.14 [Dark/Light Theme](#214-darklight-theme)
   - 2.15 [System Messages](#215-system-messages)
3. [Roles & Permissions](#3-roles--permissions)
4. [Technical Specifications (Property Dictionary)](#4-technical-specifications-property-dictionary)
   - 4.1 [Backend — Entities & Endpoints](#41-backend--entities--endpoints)
   - 4.2 [Frontend — State & Components](#42-frontend--state--components)
5. [Style & Format Guide](#5-style--format-guide)
6. [System Architecture](#6-system-architecture)
7. [Configuration Reference](#7-configuration-reference)
8. [Error Handling](#8-error-handling)

---

## 1. Introduction

**Task Manager** is a professional web application for task management designed for individuals and teams. It allows users to create, organize, and track tasks, group them into custom lists, schedule events on an integrated calendar, and collaborate in teams with differentiated roles.

### Key Features

| Feature | Description |
|---|---|
| **Task Management** | Create, edit, delete, and track tasks with states and priorities |
| **Event Calendar** | Calendar view with scheduled events (day, week, month views) |
| **Custom Lists** | Organize tasks into personalized lists with custom colors and progress tracking |
| **Teams** | Collaborate in teams with roles (Admin / Member), task assignment, workload tracking, and invitation system |
| **Administration Panel** | User management, feature flags, and system messages (ADMIN only) |
| **Authentication** | Local login with JWT and OAuth2 support (Google, GitHub, Authentik) |
| **Dark/Light Theme** | Persistent theme switching stored in the browser |
| **Responsive Design** | Adaptive interface for desktop and mobile devices |
| **Session Management** | Automatic expiration warning with session extension capability |
| **@Mentions** | Mention team members in task comments with autocomplete |
| **Infinite Scroll** | Server-side paginated lists that load more content automatically |

### Technology Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.x, Spring Security, JPA/Hibernate, SQLite |
| Frontend | React 18, Redux Toolkit, React Router 7, React Bootstrap |
| Authentication | JWT (RS256 with RSA keys) + OAuth2 (Authorization Code flow) |
| Web Server | Caddy (SPA support, HTTPS, security headers) |
| Containers | Docker (multi-architecture: amd64, arm64, arm/v7) |
| State Persistence | Redux Persist (localStorage), React Suspense caching |

---

## 2. User Guide by Feature

### 2.1 Authentication & Registration

#### Purpose

Allows users to create an account, sign in with local credentials or OAuth2 providers, and manage their session securely. The system supports multiple authentication providers that can be enabled or disabled through configuration.

#### Registration Fields

| Field | Data Type | Required | Validation | Description |
|---|---|---|---|---|
| First Name | Text | Yes | Not blank | User's first name |
| First Surname | Text | Yes | Not blank | User's first surname |
| Second Surname | Text | No | — | User's second surname (optional) |
| Username | Text | Yes | Unique, not blank | Unique identifier for the user |
| Email | Email | Yes | Unique, valid format | Unique email address |
| Password | Password | Yes | Not blank | Account password |
| Confirm Password | Password | Yes | Must match password | Password confirmation |

#### Step-by-Step Flow — Registration

1. Navigate to the landing page and click **Create account**.
2. Fill in all required fields in the registration form.
3. Ensure the password and confirmation match.
4. Click **Sign up**.
5. The backend validates the data:
   - Checks that the username and email are not already registered.
   - Encrypts the password using BCrypt (cost factor 12).
   - Assigns the `BASIC` role with `READ_PRIVILEGES` authority.
   - Sets `LOCAL` as the authentication provider.
6. On success, a toast notification is shown and you are redirected to the login page.
7. On failure (duplicate username/email, validation error), an error toast is displayed with the specific issue.

#### Step-by-Step Flow — Local Login

1. Navigate to the landing page and click **Sign in**.
2. Enter your **username** and **password**.
3. Click **Sign in**.
4. The backend performs the following:
   - Validates that the user exists in the database.
   - Checks whether the user account is blocked (blocked users receive HTTP 403).
   - Verifies the password against the stored BCrypt hash.
   - Generates a JWT token signed with RSA-256, valid for 4 hours.
   - The token payload includes: `sub` (username), `roles` (comma-separated authorities), `exp` (expiration timestamp).
5. The frontend stores the token in Redux (persisted to `localStorage` via Redux Persist).
6. You are redirected to the Home Dashboard.

#### Step-by-Step Flow — OAuth2 Login (Google / GitHub / Authentik)

1. On the login page, click the button for your preferred provider (**Google**, **GitHub**, or **Authentik**).
   - Provider buttons only appear if the provider is enabled in the system configuration.
   - A loading spinner is shown on the button while connecting.
2. You are redirected to the external provider's authorization page.
3. Grant the requested permissions at the provider's site.
4. The provider redirects back to the backend callback URL with an authorization code.
5. The backend exchanges the code for access tokens and retrieves your profile:
   - **Email extraction**: The system extracts your email from the provider response.
   - **User lookup**: Searches the database by email.
   - **Existing user**: Adds the new OAuth2 provider to your account (provider linking). Updates your name/username if missing.
   - **New user**: Creates a new account automatically:
     - Username is derived from your provider profile (e.g., GitHub login) or generated from email prefix.
     - If the username already exists, a numeric suffix is appended (e.g., `john1`, `john2`).
     - The `BASIC` role is assigned by default.
6. The backend generates a JWT token and redirects to the frontend with `?token=<jwt>` in the URL.
7. The frontend detects the token in the URL, stores it, and proceeds to the Home Dashboard.
8. If authentication fails, the frontend shows an error toast with the specific error message.

> **Note:** OAuth2 providers must be configured in both the backend (`application.properties`) and frontend (`config.js`). See the [Configuration Reference](#7-configuration-reference) section.

#### Additional Options

- **Theme Toggle:** Use the floating button in the bottom-left corner (sun/moon icon) to switch between light and dark themes. The preference is saved in `localStorage`.
- **System Message:** If an administrator has configured a system message to display before login, a modal will appear on the landing page.

---

### 2.2 Home Dashboard

#### Purpose

Provides a comprehensive overview of the user's task status, including recent tasks, upcoming events, statistics, and quick access cards to navigate to main features.

#### Dashboard Sections

| Section | Description |
|---|---|
| Hero Section | Welcome message with the application tagline and a call-to-action button to navigate to tasks |
| Quick Access Cards | Four clickable cards: **My Tasks**, **Calendar**, **Lists**, **Teams** — each navigates to its respective section |
| Statistics | Three stat cards showing: total tasks count, total lists count, and number of upcoming events |
| Completion Progress | Progress bar showing the ratio of completed tasks to total recent tasks, with a completion badge |
| Recent Tasks | The 5 most recently created tasks, ordered by creation date (descending). Each shows name, state badge, and creation date. Clickable to open task details |
| Upcoming Events | The 5 next scheduled events from the current time. Each shows event name, start/end times, and a calendar icon. Clickable to navigate to the calendar |

#### Step-by-Step Flow

1. After logging in, you are automatically redirected to the Home Dashboard (`/home`).
2. View your statistics at the top — total tasks, lists, and upcoming events.
3. Check the **completion progress bar** to see how many recent tasks you've finished.
4. Use the **Quick Access Cards** to navigate directly to Tasks, Calendar, Lists, or Teams.
5. Review your **Recent Tasks** in the bottom-left column — click any task to view its details.
6. Review your **Upcoming Events** in the bottom-right column — click any event to go to the calendar.

#### Data Loading

- The dashboard fetches data from the `GET /api/home-summary` endpoint.
- The response includes: `recentTasks` (last 5), `nextEvents` (next 5 from now), `totalTasks`, and `totalLists`.
- A skeleton loading animation (Bootstrap Placeholder with glow) is shown while data loads.
- If loading fails, an error state with a retry message is displayed.

#### Empty States

| Condition | Message |
|---|---|
| No tasks created | "You haven't created any tasks yet" |
| No upcoming events | "No upcoming events scheduled" |
| Loading error | "Error loading tasks/events" |

---

### 2.3 Task Management

#### Purpose

Allows users to create, edit, delete, and track individual tasks with different states, priorities, and optional event scheduling. Tasks are the core entity of the application and can be associated with lists and teams.

#### Task Fields

| Field | Data Type | Required | Constraints | Description |
|---|---|---|---|---|
| Task Name | Text | Yes | Not blank | Descriptive title of the task |
| Description | Long Text | No | Max 10,000 characters (stored as LOB) | Detailed description of the task |
| State | Enum | Yes | One of 5 values | Current state of the task |
| Priority | Enum | Yes | One of 5 values | Priority level of the task |
| Is Event? | Boolean | No | Default: false | Whether this task has scheduled start/end times |
| Start Date | Date & Time | Conditional | Required if `isEvent` is true | Event start date and time |
| End Date | Date & Time | Conditional | Required if `isEvent` is true; must be after start date | Event end date and time |

#### State Values

| State | Description | Badge Color | Progress % |
|---|---|---|---|
| `NEW` | New task, not started | Blue (Info) | 0% |
| `IN_PROGRESS` | Task currently in progress | Blue (Primary) | 50% |
| `COMPLETED` | Task finished | Green (Success) | 100% |
| `CANCELLED` | Task cancelled | Red (Danger) | 0% |
| `PAUSSED` | Task temporarily paused | Yellow (Warning) | 50% |

#### Priority Values

| Priority | Description | Badge Color |
|---|---|---|
| `CRITICAL` | Critical priority — needs immediate attention | Red (Danger) |
| `HIGH` | High priority | Orange (Warning) |
| `MEDIUM` | Medium priority | Blue (Info) |
| `LOW` | Low priority | Gray (Secondary) |
| `MIN` | Minimum priority | Green (Success) |

#### Step-by-Step Flow — Create Task

1. Navigate to **My Tasks** from the sidebar or the Quick Access card on the Home Dashboard.
2. Click the **New Task** button (icon `+`) in the top area.
3. A modal form appears. Fill in the fields:
   - Enter the **task name** (required).
   - Optionally add a **description** (supports up to 10,000 characters).
   - Select the **state** (`NEW` is selected by default).
   - Select the **priority**.
   - If you want to schedule the task as an event:
     - Toggle the **Is Event?** switch to on.
     - Select the **start date** and **start time** using the date/time inputs.
     - Select the **end date** and **end time**.
     - The system combines date and time fields using dayjs before submission.
4. Click **Create**.
5. The task is created via `POST /api/tasks/create` and the task cache is invalidated.
6. A success toast appears and the task list refreshes automatically.
7. The new task appears in the task list.

#### Step-by-Step Flow — Edit Task

1. In the task list, click the **edit button** (pencil icon) on the desired task.
2. The same modal form opens, pre-populated with the task's current data.
3. Modify any fields as needed.
4. Click **Save changes**.
5. The task is updated via `POST /api/tasks/update/{id}`.

#### Step-by-Step Flow — Delete Task

1. In the task list, click the **delete button** (trash icon) on the desired task.
2. A confirmation dialog appears asking you to confirm the deletion.
3. Click **Delete** to confirm, or **Cancel** to abort.
4. On confirmation, the task is deleted via `DELETE /api/tasks/delete/{id}`.
5. A success toast appears and the task list refreshes.

#### Additional Options

- **Search:** Use the search field at the top of the task list to filter tasks by name. The filter is applied client-side on the loaded results.
- **Task Detail:** Click on a task's name to navigate to its full detail view, where you can see complete information, the action history, and add comments. See [Task Detail View](#24-task-detail-view).
- **Infinite Scroll:** The task list uses server-side pagination with infinite scroll (50 tasks per page). As you scroll to the bottom, the next page loads automatically via `GET /api/tasks/tasks/paged?page=N&size=50`.
- **Cache Invalidation:** When you navigate to the Tasks section via the sidebar, the task cache is automatically invalidated to ensure fresh data.

---

### 2.4 Task Detail View

#### Purpose

Provides a comprehensive view of a single task with full metadata, visual indicators, event information, and access to the task's action history.

#### Layout

The task detail view (`/home/tasks/:id`) is composed of two main sections:

1. **Task Information (TaskDetailsTask)** — displays all task metadata
2. **Task Actions (TaskDetailsActions)** — displays the comment/action history with add capability

#### Task Information Section

| Element | Description |
|---|---|
| **Back Button** | Navigates back to the task list |
| **Edit Button** | Opens the edit modal pre-filled with the task's data |
| **Header Card** | Gradient-colored card based on task state. Displays task name, ID, status badge, and a progress bar |
| **Information Badges** | Priority badge (color-coded), Event/Task type badge, assigned user, associated list name (clickable link to list), associated team name (clickable link to team) |
| **Date Cards** | Created date is always shown. Start date and end date are shown only for event tasks |
| **Description** | Full description with a "Show More/Less" toggle. First 100 characters are shown by default. Empty state icon if no description |

#### Header Gradient Colors

| Task State | Gradient Style |
|---|---|
| `COMPLETED` | Green gradient |
| `IN_PROGRESS` | Blue-purple gradient |
| `CANCELLED` | Red gradient |
| `NEW` | Light blue gradient |
| `PAUSSED` | Yellow-orange gradient |

#### Navigation Links

- **List Badge:** If the task belongs to a list, clicking the list name navigates to `/home/lists/{listId}`.
- **Team Badge:** If the task belongs to a team, clicking the team name navigates to `/home/teams/{teamId}`.

---

### 2.5 Task Actions & Comments

#### Purpose

Allows users to record actions, comments, and edits on a task, maintaining a complete activity history. In team contexts, supports @mentions of team members.

#### Action Fields

| Field | Data Type | Required | Description |
|---|---|---|---|
| Action Title | Text | Yes | Brief title for the action |
| Description | Text | No | Detailed description. Supports @mentions in team context |
| Action Type | Enum | Yes | Currently: `COMMENT` (other types `EDIT_TASK`, `CREATE_TASK` are system-generated) |

#### Action Types and Visual Styling

| Type | Color | Icon | Description |
|---|---|---|---|
| `CREATE_TASK` | Green (Success) | Plus icon | System-generated when a task is created |
| `EDIT_TASK` | Blue (Primary) | Pencil icon | System-generated when a task is edited |
| `COMMENT` | Cyan (Info) | Chat icon | User-generated comment or note |

#### Step-by-Step Flow — Add Comment

1. Navigate to a task's detail view by clicking on the task name in any list.
2. Scroll down to the **Actions** section below the task information.
3. Click the **New Action** button (plus icon).
4. A modal form appears:
   - Enter an **Action Title** (required).
   - Enter a **Description**:
     - If the task belongs to a team, a special **MentionInput** field is shown that supports `@username` autocomplete.
     - If the task is personal (no team), a regular textarea is shown.
   - The **Action Type** defaults to `COMMENT`.
5. Click **Save Action**.
6. The action is created via `POST /api/tasks/{taskId}/actions` with the current username and timestamp automatically set.
7. A success toast appears and the action list refreshes.

#### @Mentions Feature

When a task belongs to a team, the action description field supports @mentions:

1. Type `@` followed by a team member's username.
2. A dropdown suggestion list appears with matching team members (up to 5 suggestions).
3. Click on a member's name or press **Enter** to insert the mention.
4. The mention is rendered as `@username` with blue highlighting in the action history.
5. Press **Escape** to close the suggestion dropdown without selecting.

The mention system:
- Filters members in real-time as you type (case-insensitive).
- Preserves cursor position after inserting a mention.
- Only triggers when there are no spaces after the `@` symbol.
- Closes automatically when clicking outside the dropdown.

#### Search and Sort

- **Search:** Type in the search field to filter actions by title, description, or author. Filtering is applied client-side.
- **Sort:** Toggle between "Newest first" and "Oldest first" to change the display order.

#### Pagination

Actions use server-side infinite scroll pagination via `GET /api/tasks/{taskId}/actions/paged?page=N&size=50`. More actions load automatically as you scroll down.

---

### 2.6 Event Calendar

#### Purpose

Displays tasks marked as events on an interactive calendar with month, week, and day views. Powered by React Big Calendar.

#### How Events Are Created

Tasks become calendar events when the **Is Event?** toggle is enabled during task creation or editing, and start/end dates are provided. See [Task Management](#23-task-management) for details.

#### Step-by-Step Flow

1. Navigate to **Calendar** from the sidebar.
2. The calendar loads all events from `GET /api/tasks/events/get`, which returns events for the current user.
3. Events are displayed as colored blocks on the calendar based on their start and end times.
4. Use the controls in the toolbar to switch between views:
   - **Month**: Full month grid view.
   - **Week**: Week-by-week breakdown with hourly slots.
   - **Day**: Single day view with hourly detail.
5. Click on an event to view its task details.
6. Use the navigation arrows (**Back** / **Next**) to move between time periods.
7. Click **Today** to return to the current date.

#### Event Display

| Feature | Description |
|---|---|
| Color coding | Events are color-coded by category (work, personal, urgent) |
| Time display | Shows start and end times for each event |
| Multi-day events | Events spanning multiple days are shown as continuous blocks |
| Navigation | Click event to open associated task detail view |

> **Note:** Only tasks with `isEvent = true` and valid start/end dates appear on the calendar.

---

### 2.7 List Management

#### Purpose

Allows users to create personalized lists to organize and group related tasks. Each list has a custom color and displays a progress bar showing the ratio of completed tasks.

#### List Fields

| Field | Data Type | Required | Constraints | Description |
|---|---|---|---|---|
| List Name | Text | Yes | Not blank | Identifying title for the list |
| Description | Long Text | No | Max 10,000 characters | Description of the list's purpose |
| Color | Color Picker | Yes | Valid hex color | Identifying color for the list |

#### Step-by-Step Flow — Create List

1. Navigate to **Lists** from the sidebar.
2. Click the **New List** button (icon `+`).
3. A modal form appears. Fill in the fields:
   - Enter the **list name** (required).
   - Optionally add a **description**.
   - Select a **color** using the color picker.
4. Click **Create**.
5. The list is created via `POST /api/lists/create` and the list cache is invalidated.
6. The new list appears in the lists view.

#### Step-by-Step Flow — Edit List

1. In the lists view, click the **edit button** on the desired list.
2. Modify the fields as needed in the modal form.
3. Click **Save changes**.

#### Step-by-Step Flow — Delete List

1. In the lists view, click the **delete button** on the desired list.
2. Confirm the deletion in the confirmation dialog.
3. **Important:** Deleting a list does NOT delete the tasks it contains. Tasks simply lose their list association and become unassigned.

#### Additional Options

- **Search:** Filter lists by name using the search field at the top.
- **List Detail:** Click on a list's name to access its detail view with full task management. See [List Detail View](#28-list-detail-view).
- **Infinite Scroll:** Lists use server-side pagination (50 per page) with automatic loading on scroll.

---

### 2.8 List Detail View

#### Purpose

Displays detailed information about a list including all contained tasks, a progress bar, and tools for adding/removing tasks from the list.

#### Layout

The list detail view (`/home/lists/:id`) contains:

| Section | Description |
|---|---|
| **Header** | Back button, "List Management" title, and Edit button |
| **Main Card** | Gradient-colored header (changes based on completion percentage), list name, ID, and completion badge showing `{completed}/{total} Done` |
| **Statistics Cards** | Three cards: Total Tasks count, Completed Tasks count, and Progress percentage |
| **Description** | Full description with "Show More/Less" toggle |
| **Add Tasks Button** | Button to open the add tasks modal |
| **Task List** | All tasks in the list with state/priority badges, completion indicators, and action buttons |

#### Header Gradient Colors (by completion %)

| Completion Range | Gradient Style |
|---|---|
| 100% | Green gradient |
| 60% – 99% | Blue-purple gradient |
| 30% – 59% | Orange-yellow gradient |
| 0% – 29% | Gray gradient |

#### Step-by-Step Flow — Add Tasks to a List

1. In the list detail view, click the **Add Tasks** button.
2. A modal appears showing all your tasks that are **not currently assigned to any list**.
   - The available tasks are fetched via `GET /api/tasks/getTasksResumeWithoutList`.
3. Use the search field in the modal to filter available tasks by name.
4. Select tasks by clicking the checkboxes next to each task.
5. Click **Add Selected**.
6. The selected tasks are added via `POST /api/lists/{listId}/tasks/{taskId}` (one per task).
7. A success toast appears and the list detail refreshes.

#### Step-by-Step Flow — Remove Task from a List

1. In the list detail view, locate the task you want to remove.
2. Click the **remove button** (X icon) next to the task.
3. The task is removed from the list via `DELETE /api/lists/{listId}/tasks/{taskId}`.
4. **Note:** The task is not deleted — it only loses its list association.

#### Task Display in List

Each task in the list shows:
- **Completion indicator:** A filled circle (green check) for completed tasks, empty circle otherwise.
- **Task name:** Shown with strikethrough styling if the task is completed.
- **State badge:** Color-coded state badge.
- **Priority badge:** Color-coded priority badge.
- **Open button:** Navigates to the task detail view at `/home/tasks/{taskId}`.
- **Remove button:** Removes the task from the list (does not delete the task).

---

### 2.9 Team Management

#### Purpose

Allows users to create teams, manage members with differentiated roles, assign tasks, and view team statistics. Teams enable collaborative task management with role-based access control.

#### Team Fields

| Field | Data Type | Required | Constraints | Description |
|---|---|---|---|---|
| Team Name | Text | Yes | Not blank | Identifying name for the team |
| Description | Long Text | No | Max 5,000 characters | Description of the team's purpose |

#### Team Roles

| Role | Description |
|---|---|
| **ADMIN** | Team administrator. Can edit the team, manage members, assign tasks, send invitations, and delete the team |
| **MEMBER** | Standard member. Can view team tasks, access the team dashboard, and leave the team |

> **Note:** The user who creates a team is automatically assigned the ADMIN role.

#### Step-by-Step Flow — Create Team

1. Navigate to **Teams** from the sidebar.
2. Click the **New Team** button (icon `+`).
3. Enter the **team name** and optionally a **description**.
4. Click **Create**.
5. The team is created via `POST /api/teams/create`.
6. You are automatically assigned as the team's ADMIN.
7. The team appears in your teams list.

#### Step-by-Step Flow — Edit Team (ADMIN only)

1. Open the team dashboard by clicking the team name.
2. Click the **Edit** button in the team header.
3. Modify the team name or description.
4. Click **Save changes**.

#### Step-by-Step Flow — Delete Team (ADMIN only)

1. Open the team dashboard.
2. Click the **Delete** button.
3. Confirm in the confirmation dialog.
4. The team and all its member associations are permanently deleted.

#### Step-by-Step Flow — Leave Team

1. Open the team dashboard.
2. Click the **Leave Team** button.
3. Confirm in the confirmation dialog.

> **Important Restriction:** The last ADMIN of a team cannot leave. You must promote another member to ADMIN before leaving. This prevents orphaned teams with no administrator.

#### Pending Invitations

When you navigate to the **Teams** section, any pending team invitations are displayed at the top of the page with **Accept** and **Reject** buttons. See [Team Invitations](#211-team-invitations) for details.

---

### 2.10 Team Dashboard

#### Purpose

Provides a comprehensive management interface for a team with statistics, task management, assignment history, and invitation management. The dashboard adapts based on the user's role within the team (ADMIN vs. MEMBER).

#### Dashboard Tabs

| Tab | Content | Accessible By |
|---|---|---|
| **Dashboard** | Team statistics, progress bar, member workload visualization, member management | All members (management actions ADMIN only) |
| **Tasks** | Filterable team task list with assignment capabilities | All members (assignment ADMIN only) |
| **History** | Chronological record of task assignments and reassignments | All members |
| **Invitations** | Send, view, and cancel team invitations | ADMIN only |

#### Dashboard Tab — Statistics

| Statistic | Description |
|---|---|
| Total Tasks | Total number of tasks assigned to the team |
| Completed | Number of tasks in `COMPLETED` state |
| In Progress | Number of tasks in `IN_PROGRESS` state |
| Pending | Number of tasks not yet started (`NEW` state) |
| Progress Bar | Visual indicator of completion percentage |
| Member Workload | Per-member breakdown showing how many pending tasks each member has |

#### Step-by-Step Flow — Manage Members (ADMIN only)

1. In the **Dashboard** tab, scroll to the members section.
2. Each member is displayed with their username, role badge, join date, and pending task count.
3. Available actions for each member:
   - **Promote to ADMIN:** Click the promotion button to change a MEMBER to ADMIN.
   - **Demote to MEMBER:** Click the demotion button to change an ADMIN to MEMBER.
     - ⚠️ Not allowed if this is the last ADMIN — the system prevents leaving the team without an administrator.
   - **Remove Member:** Click the remove button to remove a member from the team.
     - ⚠️ Not allowed if the member is the last ADMIN.
4. Role changes are applied via `PUT /api/teams/{teamId}/members/{memberId}/role`.
5. Member removal is performed via `DELETE /api/teams/{teamId}/members/{memberId}`.

#### Tasks Tab — Filters and Assignment

| Filter | Options | Description |
|---|---|---|
| Member | All members in the team | Show only tasks assigned to a specific member |
| State | `NEW`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `PAUSSED` | Filter by task state |
| Priority | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `MIN` | Filter by task priority |

**Step-by-Step — Assign/Reassign Task (ADMIN only):**

1. In the **Tasks** tab, locate the task you want to assign.
2. Click the **assign button** on the task.
3. Select the target member from the dropdown.
4. Confirm the assignment.
5. The assignment is recorded via `POST /api/teams/{teamId}/tasks/{taskId}/assign` and an entry is created in the assignment history.

**Step-by-Step — Add Existing Task to Team (ADMIN only):**

1. In the **Tasks** tab, click **Add Task**.
2. Select from your existing tasks.
3. The task is associated with the team via `POST /api/teams/{teamId}/tasks/{taskId}/add`.

#### History Tab

Displays a chronological log of all task assignments and reassignments within the team. Each entry shows:

| Field | Description |
|---|---|
| Task Name | Name of the task that was assigned/reassigned |
| From | Previous assignee (empty for initial assignments) |
| To | New assignee |
| Changed By | User who performed the assignment |
| Date | Date and time of the change |

History uses server-side infinite scroll pagination.

---

### 2.11 Team Invitations

#### Purpose

A token-based invitation system for securely adding new members to a team. Each invitation generates a unique token and can be accepted or rejected by the invited user.

#### Invitation Fields

| Field | Data Type | Required | Description |
|---|---|---|---|
| Username | Text | Yes | Username of the user to invite |

#### Invitation Statuses

| Status | Description |
|---|---|
| `PENDING` | Invitation sent, waiting for response |
| `ACCEPTED` | Invitation accepted — user is now a team member |
| `REJECTED` | Invitation rejected by the invited user |

#### Step-by-Step Flow — Send Invitation (Team ADMIN only)

1. Open the team dashboard and navigate to the **Invitations** tab.
2. Enter the **username** of the user you want to invite.
3. Click **Send Invitation**.
4. The backend creates the invitation via `POST /api/teams/{teamId}/invitations`:
   - Validates that the user exists.
   - Checks that the user is not already a team member.
   - Generates a unique invitation token.
   - Sets status to `PENDING`.
5. The invitation appears in the pending invitations list.

#### Step-by-Step Flow — Respond to an Invitation

1. Navigate to the **Teams** section from the sidebar.
2. Pending invitations are displayed at the top of the teams view as cards showing:
   - Team name
   - Who sent the invitation
   - Date of the invitation
3. For each invitation, click **Accept** or **Reject**.
4. The response is sent via `POST /api/teams/invitations/{token}/respond?accept=true|false`:
   - **Accept:** You are added as a `MEMBER` of the team. The team appears in your teams list and you can access its dashboard.
   - **Reject:** The invitation is marked as rejected and disappears from your pending list.

#### Step-by-Step Flow — Cancel Invitation (Team ADMIN only)

1. In the **Invitations** tab of the team dashboard, find the pending invitation.
2. Click **Cancel** next to the invitation.
3. The invitation is deleted via `DELETE /api/teams/{teamId}/invitations/{invitationId}`.

---

### 2.12 Administration Panel

#### Purpose

Allows system administrators to manage users, configure feature flags, and set system-wide messages. The entire panel is accessible only to users with the `ADMIN` role. The panel is protected at both the frontend (navigation hidden, route guarded) and backend (`@Secured("ROLE_ADMIN")`) levels.

#### Panel Tabs

##### 2.12.1 User Management

| Action | Description | Endpoint |
|---|---|---|
| **Search Users** | Search by username or email. Results paginated | `GET /api/admin/users?query=...` |
| **View Detail** | View a user's tasks, lists, and teams in a modal with tabs | `GET /api/admin/users/{userId}` |
| **Block/Unblock** | Toggle a user's blocked status | `POST /api/admin/users/{userId}/toggle-block` |
| **Edit Resources** | Edit any user's tasks, lists, or teams using existing edit components | Uses standard task/list/team endpoints with ADMIN role bypass |

##### Step-by-Step — Search and View User

1. Navigate to the **Admin Panel** from the sidebar (only visible to ADMIN users).
2. In the **Users** tab, enter a search query (username or email) in the search field.
3. Press **Search** or hit Enter.
4. Results appear as user cards showing: username, email, creation date, blocked status.
5. Click **View Details** to open a modal with three sub-tabs:
   - **Tasks:** Shows all tasks (using `TaskSummaryDTO` for optimized payload). Full task details are loaded on-demand when editing.
   - **Lists:** Shows all lists.
   - **Teams:** Shows all teams.
6. From the detail modal, you can edit or delete any of the user's resources.

##### Step-by-Step — Block a User

1. In the **Users** tab, search for the user.
2. Click the **Block** button on the user card.
3. Confirm in the confirmation dialog.
4. The user's account is immediately blocked:
   - The `blocked` flag is set to `true` in the database.
   - The `JWTAuthorizationFilter` checks this flag on every authenticated request.
   - Even if the user has a valid JWT token, all requests return **HTTP 403 Forbidden**.
   - The user is effectively locked out until unblocked.

##### Step-by-Step — Unblock a User

1. Search for the blocked user (their card shows a "Blocked" indicator).
2. Click the **Unblock** button.
3. The `blocked` flag is set to `false` and the user can access the system again.

##### 2.12.2 Feature Flags

Allows enabling or disabling entire application features at runtime, without redeployment.

| Feature Flag | Associated Feature | Sidebar Item | Description |
|---|---|---|---|
| `tasks` | Task Management | My Tasks | Enables/disables the tasks section |
| `calendar` | Event Calendar | Calendar | Enables/disables the calendar view |
| `lists` | List Management | Lists | Enables/disables the lists section |
| `teams` | Team Collaboration | Teams | Enables/disables the teams section |

**How Feature Flags Work:**

1. Feature flags are stored in the `app_config` database table with keys like `feature.tasks`, `feature.calendar`, etc.
2. The frontend `FeatureGuard` component wraps protected routes.
3. On route access, `FeatureGuard` fetches the public configuration from `GET /api/config`.
4. If the feature is set to `false`, the user is redirected to `/home` and the route is blocked.
5. The sidebar also hides navigation items for disabled features.
6. **Fail-closed approach:** If the configuration cannot be fetched (error), access is denied.

##### Step-by-Step — Manage Feature Flags

1. In the **Admin Panel**, navigate to the **Features** tab.
2. Toggle the switch next to each feature to enable or disable it.
3. Changes are saved via `PUT /api/admin/features/{featureName}` and take effect immediately for all users.
4. Disabled features: their routes are blocked, sidebar items are hidden, and attempts to navigate directly to the URL redirect to the Home Dashboard.

##### 2.12.3 System Message

Allows configuring a message that is displayed to all users as a modal notification.

| Field | Data Type | Description |
|---|---|---|
| Message | Text (rich content) | The content of the system message |
| Enabled | Boolean | Activates/deactivates the message globally |
| Show Before Login | Boolean | Display the message on the landing/login page |
| Show After Login | Boolean | Display the message after the user logs in |

##### Step-by-Step — Configure System Message

1. In the **Admin Panel**, navigate to the **System Message** tab.
2. Enter the message content.
3. Toggle **Enabled** to activate the message.
4. Choose display timing:
   - **Show Before Login:** The message appears as a modal on the landing page, visible to unauthenticated users.
   - **Show After Login:** The message appears as a modal inside the application after authentication.
   - Both options can be enabled simultaneously.
5. Click **Save**.
6. The message configuration is stored via `PUT /api/admin/system-message` as key-value pairs in the `app_config` table:
   - `system.message` — the message text
   - `system.message.enabled` — enabled flag
   - `system.message.beforeLogin` — pre-login display flag
   - `system.message.afterLogin` — post-login display flag

---

### 2.13 Session Management

#### Purpose

The user's session is managed via JWT tokens with a 4-hour lifetime. The system monitors token expiration and proactively warns the user before the session expires, giving them the option to extend it.

#### Session Lifecycle

```
Token Issued (login)
    │
    │  Valid for 4 hours
    │
    ├── Every 30 seconds: Check token time remaining
    │
    ├── Time remaining > 5 minutes: No action
    │
    ├── Time remaining ≤ 5 minutes: Show warning modal
    │       │
    │       ├── 60-second countdown starts
    │       │
    │       ├── User clicks "Extend Session":
    │       │       → POST /api/session/refresh
    │       │       → New JWT generated with fresh 4-hour TTL
    │       │       → Modal closes, countdown resets
    │       │       → Info toast: "Session extended successfully"
    │       │
    │       ├── User clicks "Logout":
    │       │       → Session terminated, redirect to /login
    │       │
    │       └── Countdown reaches 0:
    │               → Warning toast: "Session expired"
    │               → Auto-logout, redirect to /login
    │
    └── Token expired (time remaining ≤ 0): Force logout immediately
```

#### Warning Modal Behavior

| Aspect | Detail |
|---|---|
| **Backdrop** | Static — cannot dismiss by clicking outside the modal |
| **Keyboard** | Escape key is disabled — user must choose an action |
| **Countdown Display** | Large timer in MM:SS format (e.g., "00:45") |
| **Buttons** | "Logout" (danger) and "Extend Session" (primary) |
| **Warning Frequency** | Only shown once per token (flag prevents repeated warnings) |

#### Backend Refresh Flow

When the user clicks **Extend Session**:

1. Frontend calls `POST /api/session/refresh` with the current JWT in the `Authorization` header.
2. Backend validates the current token through the JWT filter.
3. `SessionRestController.refreshToken()` fetches the current authenticated user.
4. A new JWT is generated with `jwtUtilityService.generateJWT(user)` — fresh signature, updated expiration (current time + 4 hours), current roles.
5. The new token is returned as `{"token": "eyJ..."}`.
6. Frontend stores the new token in Redux (persisted to localStorage).
7. If the refresh fails (e.g., token already expired), the user is force-logged out.

---

### 2.14 Dark/Light Theme

#### Purpose

Provides a persistent dark/light theme toggle that applies across the entire application.

#### How It Works

1. Theme state is managed by `ThemeContext` using React Context API.
2. The current preference is stored in `localStorage` with the key `app-theme`.
3. On application load, the saved preference is restored.
4. Toggle via:
   - The **floating button** in the bottom-left corner (sun/moon icon) — available on all pages including login.
   - The **theme toggle** in the sidebar settings dropdown — available when authenticated.
5. When toggled:
   - The `data-bs-theme` attribute on `<html>` is set to `"dark"` or `"light"`.
   - The `theme-color` meta tag is updated (for mobile browser chrome).
   - React Bootstrap components automatically adapt to the theme.

---

### 2.15 System Messages

#### Purpose

System messages are announcements configured by administrators that appear as modals to users. They can be displayed before login (on the landing page) or after login (inside the application), or both.

#### How Messages Are Displayed

1. The `SystemMessageModal` component fetches the public configuration from `GET /api/config` (no authentication required).
2. It checks whether a message is enabled and whether it should be shown in the current context (`beforeLogin` or `afterLogin`).
3. If applicable, a Bootstrap modal appears with the message content.
4. Users can dismiss the modal by clicking the close button.

---

## 3. Roles & Permissions

### System Roles

The application defines two main roles at the system level:

| Role | Authority | Description |
|---|---|---|
| **ADMIN** | Full system access | System administrator with unrestricted access to all resources and the admin panel |
| **BASIC** | `READ_PRIVILEGES` | Standard user (assigned by default on registration). Can manage own resources and participate in teams |

### Permission Matrix — Administrator (ADMIN) vs. Standard User (BASIC)

| Feature | ADMIN | BASIC |
|---|---|---|
| **Own Tasks** | ✅ Create, read, edit, delete | ✅ Create, read, edit, delete |
| **Other Users' Tasks** | ✅ Read, edit, delete | ❌ No access |
| **Create Tasks for Others** | ✅ Allowed | ❌ Not allowed |
| **Own Lists** | ✅ Create, read, edit, delete | ✅ Create, read, edit, delete |
| **Other Users' Lists** | ✅ Read, edit, delete | ❌ No access |
| **Create Lists for Others** | ✅ Allowed | ❌ Not allowed |
| **Create Teams** | ✅ Allowed | ✅ Allowed |
| **Access Any Team** | ✅ No membership restriction (bypasses team membership check) | ❌ Only teams where the user is a member |
| **Admin Panel** | ✅ Full access | ❌ No access (hidden in sidebar, blocked at route and API level) |
| **Search/View Users** | ✅ All users | ❌ Not available |
| **Block/Unblock Users** | ✅ Allowed | ❌ Not available |
| **Manage Feature Flags** | ✅ Allowed | ❌ Not available |
| **Configure System Message** | ✅ Allowed | ❌ Not available |

### Team-Level Roles

In addition to system roles, each team member has a role within the team context:

| Team Role | Permissions Within Team |
|---|---|
| **ADMIN** | Edit team, delete team, add/remove members, promote/demote roles, assign tasks, add tasks to team, send/cancel invitations, view history |
| **MEMBER** | View team dashboard, view team tasks, view history, leave team |

### Team Security Restrictions

| Restriction | Reason | Error Behavior |
|---|---|---|
| Last ADMIN cannot leave the team | Prevents orphaned teams with no administrator | Error message returned |
| Last ADMIN cannot be demoted | Ensures at least one ADMIN always exists | Error message returned |
| Last ADMIN cannot be removed | Same as above | Error message returned |

### Backend Permission Enforcement

Permission checks are performed at the service layer using the following pattern:

```java
// Pattern used in TaskService, ListService, TeamService
if (authService.hasRole("ADMIN") || resource.getUser().getUsername().equals(currentUsername)) {
    // Operation allowed — user is either a system ADMIN or the resource owner
} else {
    throw new NotPermissionException("You don't have permission to access this resource");
}
```

**Key implementation details:**
- `authService.hasRole("ADMIN")` checks for the `ROLE_ADMIN` authority in the current security context.
- `authService.getCurrentUsername()` extracts the username from the JWT token.
- The ADMIN role bypass means system administrators can access any resource without ownership.

**Admin Panel endpoints** are additionally protected with the `@Secured("ROLE_ADMIN")` annotation at the controller level, which Spring Security enforces before the method is invoked.

### Blocked User Security

Users blocked by an administrator are rejected at the JWT filter level (`JWTAuthorizationFilter`):

1. Every authenticated request passes through the `JWTAuthorizationFilter`.
2. After validating the JWT signature and extracting the username, the filter loads the user from the database.
3. If `user.isAccountNonLocked()` returns `false` (blocked), the request is immediately rejected with **HTTP 403 Forbidden**.
4. This means a blocked user cannot access ANY endpoint, even with a valid JWT token — the block is enforced server-side on every request.

---

## 4. Technical Specifications (Property Dictionary)

### 4.1 Backend — Entities & Endpoints

#### 4.1.1 Entity `User` (table: `app_user`)

| Property | Type | Description | Associated Endpoint |
|---|---|---|---|
| `id` | `Long` | Auto-generated unique identifier | `GET /api/admin/users/{userId}` |
| `username` | `String` (unique) | User's login name | `POST /auth/login`, `POST /auth/register` |
| `email` | `String` (unique) | User's email address | `POST /auth/register` |
| `password` | `String` | BCrypt-encrypted password (cost factor 12) | `POST /auth/login`, `POST /auth/register` |
| `creationDate` | `Date` | Account creation timestamp | `GET /api/admin/users/{userId}` |
| `blocked` | `boolean` | Block status (default: false) | `POST /api/admin/users/{userId}/toggle-block` |
| `name` | `FullName` (Embedded) | Full name (name, surname1, surname2) | `POST /auth/register` |
| `roles` | `Set<RoleOfUser>` | Assigned roles (ManyToMany via `user_roles` table) | Internal — assigned on registration |
| `authProviders` | `Set<AuthProvider>` | Authentication providers: `LOCAL`, `GITHUB`, `GOOGLE` (ElementCollection) | Internal — assigned on registration/OAuth2 |
| `tasksForUser` | `Set<Task>` | User's tasks (OneToMany, cascade ALL, orphanRemoval) | `GET /api/tasks/tasks` |
| `listsForUser` | `Set<ListTM>` | User's lists (OneToMany, cascade ALL, orphanRemoval) | `GET /api/lists/lists` |

#### 4.1.2 Entity `Task`

| Property | Type | Description | Associated Endpoint |
|---|---|---|---|
| `id` | `Long` | Auto-generated unique identifier | `GET /api/tasks/{id}` |
| `nameOfTask` | `String` (required, @NotBlank) | Task name | `POST /api/tasks/create`, `POST /api/tasks/update/{id}` |
| `descriptionOfTask` | `String` (Lob, max 10,000) | Detailed description | `POST /api/tasks/create`, `POST /api/tasks/update/{id}` |
| `state` | `StateTask` (enum, @NotNull) | State: `NEW`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `PAUSSED` | `POST /api/tasks/create`, `POST /api/tasks/update/{id}` |
| `priority` | `PriorityTask` (enum, @NotNull) | Priority: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `MIN` | `POST /api/tasks/create`, `POST /api/tasks/update/{id}` |
| `creationDate` | `Date` | Creation timestamp | Automatic |
| `user` | `User` (ManyToOne) | Owner user | Automatically assigned |
| `list` | `ListTM` (ManyToOne, optional) | List the task belongs to | `POST /api/lists/{listId}/tasks/{taskId}` |
| `team` | `Team` (ManyToOne, optional) | Team the task belongs to | `POST /api/teams/{teamId}/tasks/{taskId}/add` |
| `eventTask` | `EventTask` (OneToOne, cascade ALL, orphanRemoval) | Event data (start/end) | `POST /api/tasks/create` |
| `actions` | `List<ActionTask>` (OneToMany, cascade ALL, orphanRemoval) | Action history | `POST /api/tasks/{taskId}/actions` |

#### 4.1.3 Entity `ListTM` (table: `list_tm`)

| Property | Type | Description | Associated Endpoint |
|---|---|---|---|
| `id` | `Long` | Auto-generated unique identifier | `GET /api/lists/getList/{id}` |
| `nameOfList` | `String` (required, @NotBlank) | List name | `POST /api/lists/create`, `PUT /api/lists/update/{id}` |
| `descriptionOfList` | `String` (Lob, max 10,000) | List description | `POST /api/lists/create`, `PUT /api/lists/update/{id}` |
| `color` | `String` (required, @NotBlank) | Hex color code | `POST /api/lists/create`, `PUT /api/lists/update/{id}` |
| `user` | `User` (ManyToOne) | Owner user | Automatically assigned |
| `listTasks` | `List<Task>` (OneToMany, cascade PERSIST/MERGE) | Tasks in the list | `POST /api/lists/{listId}/tasks/{taskId}` |

#### 4.1.4 Entity `Team`

| Property | Type | Description | Associated Endpoint |
|---|---|---|---|
| `id` | `Long` | Auto-generated unique identifier | `GET /api/teams/{teamId}` |
| `name` | `String` (required, @NotBlank) | Team name | `POST /api/teams/create`, `PUT /api/teams/{teamId}` |
| `description` | `String` (Lob, max 5,000) | Team description | `POST /api/teams/create`, `PUT /api/teams/{teamId}` |
| `creationDate` | `Date` | Creation timestamp | Automatic |
| `members` | `List<TeamMember>` (OneToMany, cascade ALL, orphanRemoval) | Team members | `GET /api/teams/{teamId}` |

#### 4.1.5 Entity `TeamMember`

| Property | Type | Description | Associated Endpoint |
|---|---|---|---|
| `id` | `Long` | Auto-generated unique identifier | `DELETE /api/teams/{teamId}/members/{memberId}` |
| `team` | `Team` (ManyToOne, required) | Parent team | Internal |
| `user` | `User` (ManyToOne, required) | Member user | Internal |
| `role` | `TeamRole` (enum, required) | Role: `ADMIN` or `MEMBER` | `PUT /api/teams/{teamId}/members/{memberId}/role` |
| `joinedDate` | `Date` | Date the user joined the team | Automatic |

Unique constraint: `(team_id, user_id)` — a user can only be a member of a team once.

#### 4.1.6 Entity `TeamInvitation`

| Property | Type | Description | Associated Endpoint |
|---|---|---|---|
| `id` | `Long` | Auto-generated unique identifier | `DELETE /api/teams/{teamId}/invitations/{invitationId}` |
| `team` | `Team` (ManyToOne, required) | Inviting team | `POST /api/teams/{teamId}/invitations` |
| `invitedEmail` | `String` (optional) | Invited user's email | `POST /api/teams/{teamId}/invitations` |
| `invitedUsername` | `String` (optional) | Invited user's username | `POST /api/teams/{teamId}/invitations` |
| `invitedBy` | `User` (ManyToOne, required) | User who sent the invitation | Automatically assigned |
| `status` | `InvitationStatus` (enum, required) | Status: `PENDING`, `ACCEPTED`, `REJECTED` | `POST /api/teams/invitations/{token}/respond` |
| `token` | `String` (unique, required) | Unique invitation token | `POST /api/teams/invitations/{token}/respond` |
| `createdDate` | `Date` | Invitation creation timestamp | Automatic |
| `respondedDate` | `Date` | Response timestamp | Automatic on response |

#### 4.1.7 Entity `ActionTask`

| Property | Type | Description | Associated Endpoint |
|---|---|---|---|
| `id` | `Long` | Auto-generated unique identifier | `PUT /api/tasks/{taskId}/actions/{actionId}` |
| `actionName` | `String` | Action title | `POST /api/tasks/{taskId}/actions` |
| `actionDescription` | `String` | Action description | `POST /api/tasks/{taskId}/actions` |
| `actionType` | `ActionType` (enum) | Type: `COMMENT`, `EDIT_TASK`, `CREATE_TASK` | `POST /api/tasks/{taskId}/actions` |
| `user` | `String` | Username of the user who performed the action | Automatically assigned |
| `task` | `Task` (ManyToOne, LAZY) | Associated task | Internal |
| `actionDate` | `Date` | Action timestamp | Automatic |

#### 4.1.8 Entity `EventTask`

| Property | Type | Description | Associated Endpoint |
|---|---|---|---|
| `id` | `Long` | Auto-generated unique identifier | Internal |
| `startTime` | `Date` | Event start date/time | `POST /api/tasks/create` (via `startDate` DTO field) |
| `endTime` | `Date` | Event end date/time | `POST /api/tasks/create` (via `endDate` DTO field) |
| `task` | `Task` (OneToOne, mappedBy) | Associated task | `GET /api/tasks/events/get` |

#### 4.1.9 Entity `TaskAssignmentHistory`

| Property | Type | Description | Associated Endpoint |
|---|---|---|---|
| `id` | `Long` | Auto-generated unique identifier | Internal |
| `task` | `Task` (ManyToOne, required) | Reassigned task | `GET /api/teams/{teamId}/assignment-history` |
| `fromUser` | `User` (ManyToOne, optional) | Previous assignee | `GET /api/teams/{teamId}/assignment-history` |
| `toUser` | `User` (ManyToOne, required) | New assignee | `GET /api/teams/{teamId}/assignment-history` |
| `changedBy` | `User` (ManyToOne, required) | User who performed the change | `GET /api/teams/{teamId}/assignment-history` |
| `team` | `Team` (ManyToOne, required) | Team context | `GET /api/teams/{teamId}/assignment-history` |
| `changedDate` | `Date` | Change timestamp | Automatic |

#### 4.1.10 Entity `AppConfig` (table: `app_config`)

| Property | Type | Description | Associated Endpoint |
|---|---|---|---|
| `id` | `Long` | Auto-generated unique identifier | Internal |
| `configKey` | `String` (unique) | Configuration key (e.g., `feature.tasks`, `system.message`) | `GET /api/admin/features`, `PUT /api/admin/features/{name}` |
| `configValue` | `String` (Lob, max 5,000) | Configuration value | `PUT /api/admin/system-message` |

#### 4.1.11 Data Transfer Objects (DTOs)

| DTO | Key Fields | Purpose |
|---|---|---|
| `TaskDTO` | id, nameOfTask, descriptionOfTask, state, priority, isEvent, startDate, endDate, listId, listName, teamId, teamName, user, creationDate | Full task data for CRUD operations |
| `ListTMDTO` | id, nameOfList, descriptionOfList, color, user, tasks, totalElements, completedElements | Full list data with task summary |
| `TeamDTO` | id, name, description, creationDate, members, memberCount | Full team data |
| `TeamMemberDTO` | id, userId, username, email, role, joinedDate, pendingTasks | Team member details with workload |
| `TeamInvitationDTO` | id, teamId, teamName, invitedEmail, invitedUsername, invitedByUsername, status, token, createdDate | Invitation details |
| `TaskSummaryDTO` | id, nameOfTask, state, priority, listName, teamName | Lightweight task summary for admin listings |
| `TaskResumeDTO` | id, nameOfTask | Minimal task data for selection dropdowns |
| `HomeSummaryDTO` | recentTasks, nextEvents, totalTasks, totalLists | Dashboard aggregate data |
| `TeamDashboardDTO` | teamId, teamName, members, totalTasks, completedTasks, inProgressTasks, pendingTasks | Team statistics |
| `EventTaskDTO` | id, nameOfTask, startTime, endTime | Calendar event data |
| `ActionTaskDTO` | id, actionName, actionDescription, actionType, user, actionDate, taskId | Task action data |
| `TaskAssignmentHistoryDTO` | id, taskId, taskName, fromUsername, toUsername, changedByUsername, changedDate | Assignment audit entry |
| `LoginDTO` | username, password | Login credentials |
| `ResponseDTO` | errorCount, successCount, errorMessages, successMessages | Operation result with detailed messages |

#### 4.1.12 Complete Endpoint Catalog

##### Authentication (`/auth`)

| Method | Route | Body / Parameters | Response | Description |
|---|---|---|---|---|
| `POST` | `/auth/login` | `LoginDTO {username, password}` | `{token: "jwt_token"}` | User login |
| `POST` | `/auth/register` | `User {username, email, password, name}` | `ResponseDTO` | New user registration |

##### Tasks (`/api/tasks`)

| Method | Route | Body / Parameters | Response | Description |
|---|---|---|---|---|
| `POST` | `/tasks/create` | `TaskDTO` (@Valid) | `TaskDTO` | Create new task |
| `GET` | `/tasks/tasks` | — | `List<TaskDTO>` | Get all tasks for logged-in user |
| `GET` | `/tasks/tasks/paged` | `?page=0&size=50` | `Page<TaskDTO>` | Get paginated tasks |
| `GET` | `/tasks/{id}` | `id` (Path) | `TaskDTO` | Get task by ID |
| `POST` | `/tasks/update/{id}` | `id` (Path), `TaskDTO` (@Valid) | `TaskDTO` | Update task |
| `DELETE` | `/tasks/delete/{id}` | `id` (Path) | `String` | Delete task |
| `GET` | `/tasks/events/get` | — | `List<EventTaskDTO>` | Get calendar events |
| `POST` | `/tasks/{taskId}/actions` | `taskId` (Path), `ActionTaskDTO` (@Valid) | `ActionTaskDTO` | Add action to task |
| `GET` | `/tasks/{taskId}/actions` | `taskId` (Path) | `List<ActionTaskDTO>` | Get task actions |
| `GET` | `/tasks/{taskId}/actions/paged` | `taskId` (Path), `?page&size` | `Page<ActionTaskDTO>` | Get paginated actions |
| `PUT` | `/tasks/{taskId}/actions/{actionId}` | `taskId`, `actionId` (Path), `ActionTaskDTO` (@Valid) | `ActionTaskDTO` | Update action |
| `DELETE` | `/tasks/{taskId}/actions/{actionId}` | `taskId`, `actionId` (Path) | `String` | Delete action |
| `GET` | `/tasks/getTasksResumeWithoutList` | — | `List<TaskResumeDTO>` | Get tasks without a list |
| `GET` | `/tasks/user/{userId}` | `userId` (Path) | `List<TaskSummaryDTO>` | Get task summaries for a user (ADMIN) |

##### Lists (`/api/lists`)

| Method | Route | Body / Parameters | Response | Description |
|---|---|---|---|---|
| `POST` | `/lists/create` | `ListTMDTO` (@Valid) | `ListTMDTO` | Create new list |
| `GET` | `/lists/lists` | — | `List<ListTMDTO>` | Get all lists |
| `GET` | `/lists/lists/paged` | `?page=0&size=50` | `Page<ListTMDTO>` | Get paginated lists |
| `GET` | `/lists/getList/{id}` | `id` (Path) | `ListTMDTO` | Get list detail with tasks |
| `PUT` | `/lists/update/{id}` | `id` (Path), `ListTMDTO` (@Valid) | `ListTMDTO` | Update list |
| `DELETE` | `/lists/delete/{id}` | `id` (Path) | `String` | Delete list |
| `POST` | `/lists/{listId}/tasks/{taskId}` | `listId`, `taskId` (Path) | `TaskDTO` | Add task to list |
| `DELETE` | `/lists/{listId}/tasks/{taskId}` | `listId`, `taskId` (Path) | `String` | Remove task from list |

##### Teams (`/api/teams`)

| Method | Route | Body / Parameters | Response | Description |
|---|---|---|---|---|
| `POST` | `/teams/create` | `TeamDTO` (@Valid) | `TeamDTO` | Create new team |
| `GET` | `/teams/my-teams` | — | `List<TeamDTO>` | Get user's teams |
| `GET` | `/teams/my-teams/paged` | `?page&size` | `Page<TeamDTO>` | Get paginated teams |
| `GET` | `/teams/{teamId}` | `teamId` (Path) | `TeamDTO` | Get team detail |
| `PUT` | `/teams/{teamId}` | `teamId` (Path), `TeamDTO` (@Valid) | `TeamDTO` | Update team (Team ADMIN) |
| `DELETE` | `/teams/{teamId}` | `teamId` (Path) | `String` | Delete team (Team ADMIN) |
| `DELETE` | `/teams/{teamId}/members/{memberId}` | `teamId`, `memberId` (Path) | `String` | Remove member (Team ADMIN) |
| `POST` | `/teams/{teamId}/leave` | `teamId` (Path) | `String` | Leave team |
| `PUT` | `/teams/{teamId}/members/{memberId}/role` | `teamId`, `memberId` (Path), `{role}` | `TeamMemberDTO` | Change member role (Team ADMIN) |
| `POST` | `/teams/{teamId}/tasks/{taskId}/assign` | `teamId`, `taskId` (Path), `{username}` | `TaskDTO` | Assign task to member (Team ADMIN) |
| `POST` | `/teams/{teamId}/tasks/{taskId}/add` | `teamId`, `taskId` (Path) | `TaskDTO` | Add task to team (Team ADMIN) |
| `GET` | `/teams/{teamId}/dashboard` | `teamId` (Path) | `TeamDashboardDTO` | Get team statistics |
| `GET` | `/teams/{teamId}/tasks` | `teamId` (Path), `?member&state&priority` | `List<TaskDTO>` | Get filtered team tasks |
| `GET` | `/teams/{teamId}/tasks/paged` | `teamId`, `?page&size&member&state&priority` | `Page<TaskDTO>` | Get paginated filtered tasks |
| `GET` | `/teams/{teamId}/assignment-history` | `teamId` (Path) | `List<TaskAssignmentHistoryDTO>` | Assignment history |
| `GET` | `/teams/{teamId}/assignment-history/paged` | `teamId` (Path), `?page&size` | `Page<TaskAssignmentHistoryDTO>` | Paginated history |
| `POST` | `/teams/{teamId}/invitations` | `teamId` (Path), `{username}` | `TeamInvitationDTO` | Create invitation |
| `GET` | `/teams/{teamId}/invitations` | `teamId` (Path) | `List<TeamInvitationDTO>` | List team invitations |
| `DELETE` | `/teams/{teamId}/invitations/{invitationId}` | `teamId`, `invitationId` (Path) | `String` | Cancel invitation |
| `GET` | `/teams/invitations/pending` | — | `List<TeamInvitationDTO>` | User's pending invitations |
| `POST` | `/teams/invitations/{token}/respond` | `token` (Path), `{accept}` | `TeamDTO` | Accept/reject invitation |

##### Home (`/api/home-summary`)

| Method | Route | Body / Parameters | Response | Description |
|---|---|---|---|---|
| `GET` | `/home-summary` | — | `HomeSummaryDTO` | Dashboard summary |

##### Administration (`/api/admin`) — ADMIN Only

| Method | Route | Body / Parameters | Response | Description |
|---|---|---|---|---|
| `GET` | `/admin/users` | `?query` | `List<Map>` | Search users |
| `GET` | `/admin/users/paged` | `?query&page&size` | `Page<Map>` | Search users (paginated) |
| `GET` | `/admin/users/{userId}` | `userId` (Path) | `Map` | Get user details |
| `POST` | `/admin/users/{userId}/toggle-block` | `userId` (Path) | `Map` | Block/unblock user |
| `GET` | `/admin/features` | — | `Map<String,Boolean>` | Get feature flags |
| `PUT` | `/admin/features/{featureName}` | `featureName` (Path), `{enabled}` | `Map` | Update feature flag |
| `GET` | `/admin/system-message` | — | `Map` | Get system message |
| `PUT` | `/admin/system-message` | `{message, enabled, showBeforeLogin, showAfterLogin}` | `Map` | Update system message |

##### Session (`/api/session`)

| Method | Route | Body / Parameters | Response | Description |
|---|---|---|---|---|
| `POST` | `/session/refresh` | — (uses JWT from Authorization header) | `{token: "jwt_token"}` | Refresh JWT token |

##### Public Configuration (`/api/config`)

| Method | Route | Body / Parameters | Response | Description |
|---|---|---|---|---|
| `GET` | `/config` | — | `Map` | Get public configuration (no auth required) |

##### Health Check (`/health`)

| Method | Route | Body / Parameters | Response | Description |
|---|---|---|---|---|
| `GET` | `/health` | — | `"OK"` | Server health check |

---

### 4.2 Frontend — State & Components

#### 4.2.1 Global State Management

| State / Variable | Store | Persistence | Function |
|---|---|---|---|
| `auth.token` | Redux Store (`authSlice`) | `localStorage` (via Redux Persist, key: `root`) | Stores the authenticated user's JWT token |
| `darkMode` | React Context (`ThemeContext`) | `localStorage` (key: `app-theme`) | Controls light/dark theme |
| `isAuthenticated` | React State (`App.js`) | Derived from token validity | Determines if the user has an active session |

#### 4.2.2 Frontend Services

| Service | Caching Mechanism | Components | Function |
|---|---|---|---|
| `authService` | Token in Redux | `LoginPage`, `RegisterPage`, `OAuth2Login`, `App`, `SessionManager` | Login, registration, token validation, role extraction, token refresh, OAuth2 flow |
| `taskService` | Suspense Cache (`tasksCache` Map) | `Tasks`, `TasksList`, `TaskDetails`, `CalendarComponent`, `NewEditTask` | CRUD tasks, actions, events, pagination |
| `listService` | Suspense Cache (`listsCache` Map) | `Lists`, `ListsList`, `ListDetails`, `NewEditLists` | CRUD lists, task-to-list management |
| `teamService` | Suspense Cache (`teamsCache` Map) | `Teams`, `TeamsList`, `TeamDashboard`, `NewEditTeam` | CRUD teams, members, invitations, history, @mentions |
| `adminService` | Suspense Cache (`userSearchCache` Map) | `AdminPanel`, `UserManagementTab`, `FeatureFlagsTab`, `SystemMessageTab`, `UserDetailModal` | User management, feature flags, system messages |
| `homeService` | None (fresh fetch each time) | `Home` | Dashboard summary data |
| `configService` | Singleton (from `window.APP_CONFIG`) | `SidebarMenu`, `FeatureGuard`, `OAuth2Login`, `About`, `SystemMessageModal` | Application configuration, feature flags, OAuth2 settings |

#### 4.2.3 Main Components

| Component | Key Internal State | Function |
|---|---|---|
| `App.js` | `isAuthenticated`, `loading` | Main router, authentication initialization, route definitions |
| `MainApp.js` | — | Authenticated layout: sidebar + content outlet + session manager + system message modal |
| `SidebarMenu.js` | `collapsed`, `showOffcanvas`, `isMobile` | Main navigation with collapsible sidebar (desktop) and Offcanvas menu (mobile). Cache invalidation on navigation |
| `Home.js` | `summary` (HomeSummaryDTO), `loading`, `error` | Dashboard with statistics, quick access cards, recent tasks, upcoming events |
| `Tasks.js` | `showNewTask`, `showEditTask`, `searchTerm`, `refreshKey` | Main task list view with search, create, and edit capabilities |
| `TasksList.js` | `items` (useServerInfiniteScroll) | Paginated task list with delete confirmation, priority/status badges |
| `NewEditTask.js` | `formData`, `validated`, `isEvent` | Modal form for creating/editing tasks. Handles event scheduling with date/time combination |
| `TaskDetails.js` | `task`, `teamContext` | Container for task detail view. Loads team context for @mentions |
| `TaskDetailsTask.js` | `task`, `showMore`, `showEditTask` | Full task information display with gradient header, badges, dates, description toggle |
| `TaskDetailsActions.js` | `actions`, `newAction`, `searchTerm`, `sortOrder`, `teamMembers` | Action history with add form, search, sort, @mentions, and infinite scroll |
| `Lists.js` | `showNewList`, `showEditList`, `searchTerm`, `refreshKey` | Main lists view with search and CRUD |
| `ListsList.js` | `items` (useServerInfiniteScroll) | Paginated list display |
| `NewEditLists.js` | `formData`, `validated` | Modal form for creating/editing lists with color picker |
| `ListDetails.js` | `list`, `tasks`, `showAddModal`, `availableTasks`, `selectedTaskIds` | List detail with progress bar, add/remove tasks flow, searchable add modal |
| `Teams.js` | `showCreateModal`, `pendingInvitations`, `searchTerm` | Main teams view showing user's teams and pending invitations |
| `TeamsList.js` | `items` (useServerInfiniteScroll) | Paginated teams list |
| `TeamDashboard.js` | `team`, `activeTab`, `filters`, `dashboardData` | Full team management interface with 4 tabs and role-based UI |
| `DashboardTab.js` | `dashboardData`, `memberItems` | Team statistics, progress bar, member workload display |
| `TasksTab.js` | `items`, `filterMember`, `filterState`, `filterPriority` | Team tasks with 3 filters and reassignment capability |
| `HistoryTab.js` | `items` (useServerInfiniteScroll) | Paginated assignment history |
| `InvitationsTab.js` | `invitations`, `newUsername` | Invitation management (send, view, cancel). ADMIN only |
| `MentionInput.js` | `showSuggestions`, `filteredMembers`, `query` | Enhanced textarea with @mention autocomplete for team members |
| `CalendarComponent.js` | `events`, `view` | React Big Calendar integration with month/week/day views |
| `AdminPanel.js` | `activeTab` | Admin interface with Users/Features/System Message tabs |
| `UserManagementTab.js` | `searchQuery`, `users` | User search and management |
| `UserSearchResults.js` | — | Display search results with block/unblock and view detail actions |
| `UserDetailModal.js` | `activeTab`, `tasks`, `lists`, `teams` | User detail modal with tabs for tasks, lists, and teams. Lazy-loaded content |
| `FeatureFlagsTab.js` | `flags` | Feature flag toggle interface |
| `SystemMessageTab.js` | `message`, `enabled`, `showBeforeLogin`, `showAfterLogin` | System message configuration form |
| `SessionManager.js` | `showModal`, `countdown`, intervals (refs) | Session expiration monitor with warning modal and auto-logout |
| `FeatureGuard.js` | `loading`, `allowed` | Route guard based on feature flags. Redirects to /home if disabled. Fail-closed on error |
| `ProtectedRoute.js` | — | Route guard for authentication. Redirects to / if not authenticated |
| `ThemeToggleButton.js` | `darkMode` (from ThemeContext) | Floating theme toggle button (bottom-left corner) |
| `SystemMessageModal.js` | `message`, `show` | Displays system message modal (before or after login) |
| `ConfirmModal.js` | — | Generic confirmation dialog. Props: `show`, `onConfirm`, `title`, `message`, `confirmText`, `confirmVariant` |
| `About.js` | — | About modal showing app info: name, version, license, features |

#### 4.2.4 Custom Hooks

| Hook | Parameters | Returns | Function |
|---|---|---|---|
| `useServerInfiniteScroll` | `fetchPage(page, size)`, `pageSize` (default 50), `deps[]` | `{items, loading, initialLoading, hasMore, LoadMoreSpinner, reset}` | Server-side paginated infinite scroll using IntersectionObserver. Automatically loads next page when sentinel element becomes visible. Supports cancellation and dependency-based reset |
| `useInfiniteScroll` | `allItems[]`, `pageSize` (default 50) | `{displayedItems, sentinelRef, hasMore, LoadMoreSpinner}` | Client-side infinite scroll for pre-loaded data arrays |
| `useTheme` | — | `{darkMode, toggleDarkMode}` | Access to the theme context for reading/toggling dark mode |

---

## 5. Style & Format Guide

### UI Conventions

| Element | Convention | Example |
|---|---|---|
| Primary action buttons | Blue (`primary` variant) | **Create**, **Save changes**, **Extend Session** |
| Delete/Danger buttons | Red (`danger` variant) | **Delete**, **Block**, **Logout** |
| Cancel buttons | Gray (`secondary` variant) | **Cancel**, **Close** |
| Warning buttons | Yellow (`warning` variant) | **Block** |
| Priority badges | Color by level | `CRITICAL` → red, `HIGH` → orange, `MEDIUM` → blue, `LOW` → gray, `MIN` → green |
| State badges | Color by progress | `COMPLETED` → green, `IN_PROGRESS` → blue, `CANCELLED` → red, `NEW` → light blue, `PAUSSED` → yellow |
| Role badges | Color by role | Admin → yellow (warning), Member → gray (secondary) |

### Toast Notifications

| Type | Usage | Duration | Icon |
|---|---|---|---|
| `successToast()` | Operation completed successfully | 3 seconds | ✅ |
| `errorToast()` | Operation failed | 3 seconds | ❌ |
| `warningToast()` | Warning or attention needed | 3 seconds | ⚠️ |
| `infoToast()` | General information | 3 seconds | ℹ️ |

### Responsive Design

| Device | Navigation Behavior |
|---|---|
| **Desktop** (≥768 px) | Collapsible sidebar (60px collapsed – 250px expanded) with smooth CSS transition. Toggle button in sidebar header. Text labels hidden when collapsed, only icons shown |
| **Mobile** (<768 px) | Fixed top bar with hamburger button. Offcanvas drawer slides from the left (75% width with backdrop). Closes automatically on navigation |

### Application Routes

```
/                     → Landing page (public)
/login                → Login page (public)
/register             → Registration page (public)
/oauth2-login         → OAuth2 login (public)
/health               → Health check (public)

/home                 → Home Dashboard (authenticated)
/home/tasks           → Task Management (authenticated + feature flag)
/home/tasks/:id       → Task Detail (authenticated + feature flag)
/home/calendar        → Event Calendar (authenticated + feature flag)
/home/lists           → List Management (authenticated + feature flag)
/home/lists/:id       → List Detail (authenticated + feature flag)
/home/teams           → Team Management (authenticated + feature flag)
/home/teams/:id       → Team Dashboard (authenticated + feature flag)
/home/admin           → Administration Panel (authenticated + ADMIN role)
```

### Caching Patterns

| Pattern | Implementation | Invalidation Trigger |
|---|---|---|
| Suspense Cache | In-memory `Map` with `getSuspender()` function that returns a promise wrapper for React Suspense | `invalidateXxxCache()` called on create/update/delete operations and on sidebar navigation clicks |
| Redux Persist | JWT token in `localStorage` via redux-persist (whitelist: `["auth"]`) | `clearToken()` on logout |
| Theme Persist | Theme preference in `localStorage` (key: `app-theme`) | `toggleDarkMode()` function |

### Modal Patterns

| Type | Use Case | Components |
|---|---|---|
| **Form Modals** | Create/edit resources | `NewEditTask`, `NewEditLists`, `NewEditTeam`. Static backdrop, form validation, submit refreshes parent data |
| **Confirmation Modals** | Delete/block/leave actions | `ConfirmModal`. Configurable title, message, button text, and button color |
| **Detail Modals** | View resource information | `UserDetailModal`. Tabbed content with lazy loading |
| **Warning Modals** | Session expiration | `SessionManager`. Non-dismissible (static backdrop, keyboard disabled) |

---

## 6. System Architecture

### Project Structure

```
task-manager/
├── backend/                              # Spring Boot API
│   └── src/main/java/com/taskmanager/application/
│       ├── config/                       # Configuration (CORS, messages, web security, data loader)
│       ├── context/                      # Data loader (initial roles, default users)
│       ├── controller/                   # REST controllers
│       │   ├── AuthRestController.java         # Login & registration
│       │   ├── TaskRestController.java         # Task CRUD & actions
│       │   ├── ListRestController.java         # List CRUD & task management
│       │   ├── TeamRestController.java         # Team CRUD, members, invitations
│       │   ├── AdminRestController.java        # User management, feature flags, system messages
│       │   ├── HomeRestController.java         # Dashboard summary
│       │   ├── SessionRestController.java      # JWT token refresh
│       │   ├── AppConfigRestController.java    # Public configuration
│       │   ├── HealthCheckRestController.java  # Health check
│       │   └── GlobalExceptionHandler.java     # Centralized error handling
│       ├── model/
│       │   ├── dto/                      # Data Transfer Objects
│       │   ├── entities/                 # JPA entities
│       │   ├── enums/                    # Enumerations (state, priority, roles)
│       │   └── exceptions/              # Custom exceptions
│       ├── respository/                  # JPA repositories
│       ├── security/                     # JWT filter, OAuth2 handlers
│       │   ├── JWTAuthorizationFilter.java     # JWT validation on every request
│       │   ├── OAuth2LoginSuccessHandler.java  # Post-OAuth2 JWT generation
│       │   └── OAuth2LoginFailureHandler.java  # OAuth2 error handling
│       └── service/                      # Business logic
│           ├── AuthService.java                # Authentication & authorization
│           ├── TaskService.java                # Task business logic
│           ├── ListService.java                # List business logic
│           ├── TeamService.java                # Team business logic
│           ├── AdminService.java               # Admin panel logic
│           ├── HomeService.java                # Dashboard aggregation
│           ├── JWTUtilityService.java          # JWT token generation & parsing
│           ├── RoleService.java                # Role management
│           ├── CustomOAuth2UserService.java    # OAuth2 user processing
│           ├── CustomOidcUserService.java      # OIDC user processing
│           └── CustomUserDetailsService.java   # Spring Security user loading
├── frontend/                             # React application
│   └── src/
│       ├── components/                   # React components
│       │   ├── adminpanel/               # Admin panel (6 components)
│       │   ├── auth/                     # Authentication (4 components)
│       │   ├── common/                   # Shared utilities (5 components)
│       │   ├── lists/                    # List management (4+ components)
│       │   ├── session/                  # Session management (1 component)
│       │   ├── Sidebar/                  # Navigation (2 components)
│       │   ├── tasks/                    # Task management (5+ components)
│       │   └── teams/                    # Team management (8+ components)
│       ├── context/                      # React contexts (ThemeContext)
│       ├── hooks/                        # Custom hooks (useInfiniteScroll)
│       ├── pages/                        # Page layouts (HomePage, MainApp)
│       ├── redux/                        # Redux store (authSlice, store)
│       └── services/                     # API services (6 services)
├── docs/                                 # Documentation
├── docker/                               # Docker configurations
└── scripts/                              # Build and deployment scripts
```

### Authentication Flow

```
┌──────────────────┐                                ┌──────────────────────┐
│   User Browser   │                                │   Spring Boot API    │
│   (React App)    │                                │                      │
└────────┬─────────┘                                └──────────┬───────────┘
         │                                                     │
         │  ─── LOCAL LOGIN FLOW ─────────────────────────────│
         │                                                     │
         │  1. POST /auth/login {username, password}           │
         │ ──────────────────────────────────────────────────► │
         │                                                     │ 2. Validate credentials
         │                                                     │    BCrypt.matches(password, hash)
         │                                                     │ 3. Check blocked status
         │                                                     │ 4. Generate JWT (RS256)
         │  5. {token: "eyJ..."}                               │
         │ ◄────────────────────────────────────────────────── │
         │                                                     │
         │  6. Store token in Redux → localStorage             │
         │                                                     │
         │  ─── OAUTH2 LOGIN FLOW ────────────────────────────│
         │                                                     │
         │  1. Redirect to /oauth2/authorization/{provider}    │
         │ ──────────────────────────────────────────────────► │
         │                                                     │ 2. Redirect to OAuth2 provider
         │  3. User authenticates at provider                  │
         │  4. Provider redirects back with auth code          │
         │ ──────────────────────────────────────────────────► │
         │                                                     │ 5. Exchange code for tokens
         │                                                     │ 6. Fetch user profile from provider
         │                                                     │ 7. Find/create user in database
         │                                                     │ 8. Generate JWT
         │  9. Redirect to frontend with ?token=eyJ...         │
         │ ◄────────────────────────────────────────────────── │
         │                                                     │
         │  10. Extract token from URL, store in Redux         │
         │                                                     │
         │  ─── AUTHENTICATED API REQUEST ────────────────────│
         │                                                     │
         │  Authorization: Bearer <token>                      │
         │ ──────────────────────────────────────────────────► │
         │                                                     │ JWTAuthorizationFilter:
         │                                                     │ 1. Extract token from header
         │                                                     │ 2. Validate signature (RSA public key)
         │                                                     │ 3. Check expiration
         │                                                     │ 4. Load user from database
         │                                                     │ 5. Check blocked status → 403 if blocked
         │                                                     │ 6. Set SecurityContext with user + roles
         │  Response                                           │
         │ ◄────────────────────────────────────────────────── │
         │                                                     │
```

### JWT Security

| Parameter | Value |
|---|---|
| Signing Algorithm | RS256 (RSA with SHA-256) |
| Token Lifetime | 4 hours |
| Key Storage | PEM files (configurable path) |
| Password Encryption | BCrypt with cost factor 12 |
| Library | Nimbus JOSE + JWT |
| Token Claims | `sub` (username), `roles` (comma-separated authorities), `exp` (expiration), `iat` (issued at) |

### CORS Configuration

| Parameter | Value |
|---|---|
| Allowed Origins | Configured via `taskmanager.frontend.base-url` (default: `http://localhost:3000`) |
| Allowed Methods | `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` |
| Allowed Headers | `Origin`, `Content-Type`, `Accept`, `Authorization` |
| Credentials | Enabled |
| Max Age | 3,600 seconds (1 hour) |

### Database

| Aspect | Detail |
|---|---|
| Engine | SQLite |
| ORM | Hibernate (JPA) |
| DDL Strategy | `update` (auto-migration on startup) |
| Main Tables | `app_user`, `task`, `list_tm`, `team`, `team_member`, `team_invitation`, `action_task`, `event_task`, `task_assignment_history`, `app_config`, `role_of_user`, `authority_of_role`, `user_roles`, `user_auth_providers` |

### Entity Relationship Diagram

```
                    ┌──────────────┐
                    │   app_user   │
                    │──────────────│
                    │ id           │
                    │ username     │
                    │ email        │
                    │ password     │
                    │ blocked      │
                    │ name (embed) │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌──────────┐    ┌──────────────┐  ┌─────────────┐
   │   task   │    │   list_tm    │  │ team_member │
   │──────────│    │──────────────│  │─────────────│
   │ name     │◄──►│ name         │  │ role        │
   │ state    │    │ description  │  │ joinedDate  │
   │ priority │    │ color        │  └──────┬──────┘
   │ desc     │    └──────────────┘         │
   └──┬───┬───┘                             ▼
      │   │                          ┌──────────┐
      │   └──────────────────────────│   team   │
      │                              │──────────│
      ▼                              │ name     │
┌──────────────┐                     │ desc     │
│  event_task  │                     └──────────┘
│──────────────│                          │
│ startTime    │                          ▼
│ endTime      │                  ┌───────────────────┐
└──────────────┘                  │ team_invitation    │
                                  │───────────────────│
      ┌───────────────┐           │ token             │
      │  action_task  │           │ status            │
      │───────────────│           │ invitedUsername    │
      │ actionName    │           └───────────────────┘
      │ actionType    │
      │ user          │           ┌───────────────────────────┐
      │ actionDate    │           │ task_assignment_history    │
      └───────────────┘           │───────────────────────────│
                                  │ fromUser, toUser          │
                                  │ changedBy, changedDate    │
                                  └───────────────────────────┘
```

---

## 7. Configuration Reference

### Backend Configuration (`application.properties`)

| Property | Type | Default | Description |
|---|---|---|---|
| `server.port` | Integer | `8080` | Backend server port |
| `taskmanager.frontend.base-url` | String | `http://localhost:3000` | Frontend URL for CORS and OAuth2 redirects |
| `jwtKeys.privateKeyPath` | String | — | Path to RSA private key PEM file for JWT signing |
| `jwtKeys.publicKeyPath` | String | — | Path to RSA public key PEM file for JWT verification |
| `taskmanager.oauth2.enabled` | Boolean | `true` | Enable/disable OAuth2 authentication globally |
| `taskmanager.create-admin-user` | Boolean | `false` | Auto-create an admin user on startup |
| `taskmanager.default-admin-username` | String | `admin` | Default admin username |
| `taskmanager.default-admin-password` | String | `admin` | Default admin password (BCrypt-encoded on creation) |
| `taskmanager.default-admin-email` | String | `admin@example.com` | Default admin email |
| `taskmanager.create-basic-user` | Boolean | `false` | Auto-create a basic user on startup |
| `spring.datasource.url` | String | SQLite path | Database connection URL |
| `spring.jpa.hibernate.ddl-auto` | String | `update` | Database schema strategy |

### Frontend Configuration (`config.js`)

```javascript
window.APP_CONFIG = {
  api: {
    baseUrl: "http://localhost:8080"    // Backend API URL
  },
  oauth2: {
    enabled: false,                     // Enable OAuth2 globally
    google: { enabled: false },         // Google provider
    github: { enabled: false },         // GitHub provider
    authentik: { enabled: false }       // Authentik provider
  },
  app: {
    name: "Task Manager",              // Application display name
    version: "1.0.0",                  // Application version
    license: "AGPL-3.0",              // License type
    debug: false                       // Debug mode
  },
  features: {
    tasks: true,                       // Enable tasks feature
    calendar: true,                    // Enable calendar feature
    lists: true,                       // Enable lists feature
    teams: true                        // Enable teams feature
  }
};
```

> **Note:** Frontend configuration is loaded at runtime from `config.js` (not compiled into the build). Changes take effect immediately without rebuilding the frontend.

### Data Initialization (DataLoader)

On application startup, the `DataLoader` runs automatically to ensure minimum required data exists:

1. **ADMIN role** is created if not found (no specific authorities).
2. **BASIC role** is created if not found, with `READ_PRIVILEGES` authority.
3. **Admin user** is created if `taskmanager.create-admin-user=true` and no user with the configured username exists. Password is BCrypt-encoded.
4. **Basic user** is created if `taskmanager.create-basic-user=true` and no user named "basic" exists.

All operations are idempotent — safe to run on every startup.

> ⚠️ **Security:** Default credentials should NOT be used in production. Change or disable them before deploying.

---

## 8. Error Handling

### Backend Error Handling

The `GlobalExceptionHandler` (`@RestControllerAdvice`) provides centralized error handling for all REST controllers:

| Exception | HTTP Status | Response Format | Trigger |
|---|---|---|---|
| `MethodArgumentNotValidException` | 400 Bad Request | `{message: "Validation failed", errors: {field: "message"}}` | `@Valid` annotation fails on request body |
| `IllegalArgumentException` | 400 Bad Request | `{message: "error description"}` | Thrown in business logic |
| `NotPermissionException` | 403 Forbidden | `{message: "permission denied description"}` | User lacks required permissions |
| `ResourceNotFoundException` | 404 Not Found | `{message: "resource not found description"}` | Requested resource doesn't exist |

### Frontend Error Handling

| Scenario | Behavior |
|---|---|
| API call fails | Error toast with message from server response or generic "Error connecting to server" |
| Token expired | Session manager detects and prompts for extension or auto-logout |
| Feature disabled | `FeatureGuard` redirects to `/home` |
| Config fetch fails | Feature access denied (fail-closed) |
| OAuth2 error | Error toast with provider error message, user stays on login page |

### HTTP Status Codes

| Code | Meaning | Common Scenario |
|---|---|---|
| 200 | Success | Successful API operation |
| 400 | Bad Request | Validation failure or invalid input |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions or blocked user |
| 404 | Not Found | Resource does not exist |
| 500 | Internal Server Error | Unexpected server error |

---

> **Document generated for Task Manager v1.0.0**  
> **Last updated:** April 2026
