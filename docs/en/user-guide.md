# User guide

Task Manager brings together your tasks, your lists, your calendar and your teams in a single place. This guide explains what each section does and how to get the most out of it, without the technical bits.

## Before you start: your account

### Creating an account

If you don't have an account yet, click **Create account** on the welcome screen. You'll be asked for:

- A first name and two surnames (the second surname is optional).
- A unique **username**, which you'll use to sign in and which your team will see when they invite you to things.
- A valid **email address**.
- A **password** entered twice for confirmation.

When the form is complete the account is ready and you go straight to the dashboard.

### Signing in

From the welcome screen click **Sign in** and type your username and password. If your organization has Google, GitHub or Authentik enabled, you'll see a **Continue with SSO** button that takes you to the provider to authenticate with that account.

### When does the session end?

Your session expires after a few minutes of inactivity (10 by default). When that happens a countdown window appears: it gives you 60 seconds; touch anything and the session resumes, do nothing and it ends and you go back to the welcome screen. You can also sign out manually from your avatar menu at the bottom-left with **Log Out**.

### Switching between light and dark mode

In the same avatar menu, at the very top, there is a **Dark Mode** switch. The choice is remembered in your browser.

## The dashboard

When you sign in you land on the **Dashboard** (`/home`). It is the overview screen and has five blocks:

1. **Quick access** — four large cards (My Tasks, Calendar, Lists, Teams) that take you to the corresponding section in one click. If an administrator has disabled a section, its card is not shown.
2. **Your numbers** — total tasks you've created, lists you own and upcoming events on the calendar.
3. **Recent progress** — a bar with how many of your most recent tasks are completed versus the total.
4. **Recent tasks** — the latest tasks you created, with their state and date. Click any of them to open it, or **View all** to go to the full list.
5. **Upcoming events** — tasks that are events on the calendar, sorted by start date. Click **View calendar** to open the calendar view.

## Tasks

A task is the smallest unit of work. It has a name, a description, a state, a priority and, optionally, start and end dates. A task can also belong to a list and to a team.

### States and priorities

Every task has a **state** that says where in the work it is:

- **New** — just created, not started yet.
- **In Progress** — being worked on.
- **Paused** — left aside for a while.
- **Completed** — finished.
- **Cancelled** — dropped.

And a **priority** that signals urgency:

- **Critical** — needs immediate attention.
- **High** — important, do it soon.
- **Medium** — normal pace.
- **Low** — when you can.
- **Min** — no rush.

### Creating a task

1. In the sidebar click **My Tasks** and then **New Task** at the top right.
2. Type a name (required) and, if you want, a longer description.
3. Pick a state and a priority.
4. If the task has a specific day and time (a meeting, a deadline, a work block), tick **This task is an event** and fill in the start and end date and time. The task will then appear in the calendar.
5. Save.

If the task is not an event but you still want to track its progress, leave the box unchecked: it will just show its state.

### Searching, refreshing and clearing

At the top of the list there is a search box. Type part of a name and click **Search** to filter; **Clear** removes the filter and **Refresh** reloads from the server. The list is loaded in blocks of 50 and, as you scroll, more is fetched automatically without paginating.

### Opening, editing and deleting

- Click a task to open its **detail** view (full information and its comments).
- In the list, use the edit button to change the name, description, state, priority or dates. The change is saved when you click **Save**.
- To delete it, use the trash button. You'll be asked to confirm because it cannot be undone.

### Comments and action history

Inside a task's detail you can add **actions** (comments or notes). Each action stores who wrote it, when, and the type. If the task belongs to a team, the rest of the team also sees the actions. From the task itself you can:

- Add a comment with a title, a description and a type.
- Edit or delete your own comments.
- Browse the full chronological history.

### Turning a task into an event (or back)

A regular task has no dates. If you edit it, tick **This task is an event**, fill in the start and end dates, and it will start showing on the calendar. If you untick the box during an edit, the dates are removed and it goes back to being a task with no schedule.

## Lists

Lists group tasks that share a topic, a project or an area. Each list has a name, a description and a colour that identifies it visually. The list's progress bar tells you how many tasks it contains and how many are completed.

### Creating and editing lists

From **Lists** in the sidebar, click **New List**. Only the name and the colour are required. The description is optional but useful when the list is seen by several people. Once created, you can change any field with the edit button.

### The list detail

When you open a list you see, at the top, its header with the name, description, colour and totals; below, the tasks it contains. From the detail you can:

- **Add existing tasks** with the add button. A selector appears with tasks you own that aren't already in any list, so they aren't duplicated.
- **Remove a task from the list** with the trash button next to the task. The task itself isn't deleted, it just stops belonging to that list.
- **Search** within the list's tasks using the search box at the top.
- **Go back** to the overview with the back arrow.

The progress (completed tasks vs total) updates automatically and is shown as a bar.

### A task can only be in one list

If you add a task to another list, it leaves the first one. If you'd rather keep a task in your plain backlog without any list, don't assign it to one.

## Calendar

The calendar shows all the tasks that are events (that is, with a start and an end date). It lives under **Calendar** in the sidebar.

### Available views

There are three views: **Month**, **Week** and **Day**. Switch with the buttons at the top right. **Prev / Today / Next** move through the current date.

### What each colour means

The calendar colours events according to a category the task carries:

- **Work** (blue) — regular work.
- **Personal** (cyan) — personal items.
- **Urgent** (pink) — things that cannot wait.
- **General** (purple) — everything else.

Click an event to open the task and edit it (change the category, move it to another time, etc.).

## Teams

Teams let you work with other people: assign them tasks, see the group's progress, leave cross-comments and keep a history of who did what.

### Creating a team

Click **Teams** in the sidebar and then **New Team**. Only the name is required; the description is optional. The person who creates the team becomes its **Admin** automatically.

### Roles inside a team

There are two possible roles:

- **Admin** — can invite people, remove members, change other people's roles, assign tasks, accept or cancel invitations and delete the team.
- **Member** — sees the team's tasks, can only reassign their own tasks, and can comment.

### Inviting someone

If you're an admin, inside the team click **Invite**, type the person's username and send. The person receives the invitation on their **Teams** screen (it appears at the top as pending). They can accept or reject it; on acceptance they become a **Member** and can later be promoted to **Admin**.

If you change your mind or invited the wrong person, in the team's **Invitations** tab you can cancel the invitation before it's answered.

### Accepting or rejecting an invitation

When someone invites you, go to **Teams**. You'll see the pending invitation with the team name and who sent it. Click **Accept** to join the team or **Reject** to discard it. If you accept, the team appears in your list and the team sees you as a new member.

### The team dashboard

When you open a team you have four tabs:

- **Dashboard** — the global numbers (total tasks, completed, in progress, pending), the team's progress percentage, the workload per member (a bar per person based on their pending tasks) and the member list with their roles.
- **Tasks** — every task in the team. You can filter by member, state and priority; filters combine. If you're an admin, next to each task there is a button to reassign it to another member. Click the task name to open its detail.
- **History** — admins only. The chronological log of reassignments: which task changed hands, who had it, who received it, who made the change, and when.
- **Invitations** — admins only. Pending invitations with their date and who sent them. You can cancel them.

### Tasks inside a team

A team task is identified by the team it belongs to in its detail. From the team's dashboard you can:

- **Add tasks** you've already created (the ones not in another team) with the **Add Task** button.
- **Reassign** any task to another member, by picking who.
- **Leave the team** with **Leave** (if you're not an admin). Your personal tasks stay with you but stop counting for the team.

### Important behaviours

- **Deleting a team** keeps the tasks that belonged to it in their owners' accounts; what disappears is the team membership.
- **Leaving a team** unlinks your tasks from the team but does not delete them.
- **Removing a member** leaves the tasks they had assigned without an owner inside the team.

## Administration (ADMIN only)

If your account has the **ADMIN** role, **Admin Panel** shows up in the sidebar. It has three tabs:

### Users

Here you see the list of every user in the application. You can:

- **Search** by username, name, surname or email.
- **Open a user's profile** to see their tasks, lists and teams in separate tabs. From the profile you can also edit or delete any of their items.
- **Block or unblock** a user. A blocked user cannot sign in until you unblock them.

### Features

Lets you enable or disable the four sidebar sections — **My Tasks**, **Calendar**, **Lists** and **Teams** — for everyone at once. Changes take effect the next time each user reloads. Useful for staged rollouts or maintenance windows.

### System Message

Configures an institutional message shown to users. You can:

- Write the text (it accepts multiple lines).
- Enable or disable it.
- Choose whether to show it **before signing in** (on the public page), **after signing in** (inside the app), or both.

Useful for announcing maintenance, new features or usage policies.

## Good practices

- **Name tasks by the action, not the topic:** *"Migrate the database to PostgreSQL"* instead of *"Database"*. It saves you from opening the task to know what it is.
- **Use priority sparingly.** If everything is Critical, nothing is. Reserve Critical for things that truly block someone.
- **Only mark a task as an event when it has a time.** Background tasks don't need to clutter the calendar; only date-bound things should appear there.
- **Start with lists, not loose tasks.** Creating a list with a name and description takes a minute and everything you add to it stays organised.
- **Assign early in teams.** A task without an owner in a team won't be done. Reassign as soon as you see someone has room.
- **Check the reassignment history** when something hasn't been done: it tells you exactly when it changed hands.
