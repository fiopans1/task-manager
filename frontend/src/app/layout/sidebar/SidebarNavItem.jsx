import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

export default function SidebarNavItem({ item, collapsed, onNavigate }) {
  const IconComponent = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "group relative flex h-11 items-center gap-3 rounded-sm px-3 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
          isActive
            ? "bg-brand-soft text-brand"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
          collapsed && "justify-center px-0",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-brand"
            />
          ) : null}
          <IconComponent size={18} strokeWidth={1.75} aria-hidden="true" />
          {!collapsed ? <span className="truncate">{item.label}</span> : null}
        </>
      )}
    </NavLink>
  );
}
