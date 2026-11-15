import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ListChecks,
  ListTodo,
  Users,
} from "@/shared/lib/icons";
import { cn } from "@/shared/lib/utils";

const QUICK_LINKS = [
  { title: "My Tasks", path: "/home/tasks", icon: ListTodo },
  { title: "Calendar", path: "/home/calendar", icon: CalendarDays },
  { title: "Lists", path: "/home/lists", icon: ListChecks },
  { title: "Teams", path: "/home/teams", icon: Users },
];

export function QuickAccess({ className }) {
  const navigate = useNavigate();

  return (
    <nav
      aria-label="Quick access"
      className={cn("grid grid-cols-2 gap-2 lg:grid-cols-4", className)}
    >
      {QUICK_LINKS.map((item) => {
        const IconComponent = item.icon;

        return (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className="group flex items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-brand/40 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-xs bg-surface-2 text-brand">
              <IconComponent size={15} aria-hidden="true" />
            </span>
            <span className="min-w-0 truncate text-sm font-medium text-foreground">
              {item.title}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
