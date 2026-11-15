import {
  CalendarDays,
  ListChecks,
  ListTodo,
  ShieldCheck,
  Users,
} from "@/shared/lib/icons";

export const NAVIGATION_ITEMS = [
  {
    path: "/home/tasks",
    icon: ListTodo,
    label: "My Tasks",
    featureKey: "tasks",
  },
  {
    path: "/home/calendar",
    icon: CalendarDays,
    label: "Calendar",
    featureKey: "calendar",
  },
  {
    path: "/home/lists",
    icon: ListChecks,
    label: "Lists",
    featureKey: "lists",
  },
  {
    path: "/home/teams",
    icon: Users,
    label: "Teams",
    featureKey: "teams",
  },
  {
    path: "/home/admin",
    icon: ShieldCheck,
    label: "Admin panel",
    adminOnly: true,
  },
];

export const MAIN_NAV_ITEMS = NAVIGATION_ITEMS.filter((item) => !item.adminOnly);
export const ADMIN_NAV_ITEMS = NAVIGATION_ITEMS.filter((item) => item.adminOnly);
