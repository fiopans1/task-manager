import { Link } from "react-router-dom";
import { ChevronDown, CircleHelp, Info } from "@/shared/lib/icons";
import configService from "@/services/configService";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import SidebarNavItem from "@/app/layout/sidebar/SidebarNavItem";
import SidebarUserMenu from "@/app/layout/sidebar/SidebarUserMenu";
import { cn } from "@/shared/lib/utils";

function SectionLabel({ collapsed, children }) {
  if (collapsed) {
    return <div className="mx-auto my-3 h-px w-6 bg-border" aria-hidden="true" />;
  }

  return (
    <div className="flex items-center gap-2 px-3 pb-1 pt-5">
      <span className="text-2xs font-medium text-ink-faint">{children}</span>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  );
}

export default function SidebarContent({
  collapsed = false,
  items = [],
  displayName,
  today,
  onNavigate,
  onAbout,
  onSettings,
  onLogOut,
}) {
  const workspaceItems = items.filter((item) => !item.adminOnly);
  const adminItems = items.filter((item) => item.adminOnly);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <Link
          to="/home"
          onClick={onNavigate}
          aria-label={collapsed ? configService.getAppName() : undefined}
          className={cn(
            "flex items-center gap-3 rounded-sm border border-sidebar-border bg-surface-2/50 p-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
            collapsed && "justify-center border-transparent bg-transparent p-0",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-card">
            <img
              src="/favicon.png"
              alt=""
              width={24}
              height={24}
              className="size-6 object-contain"
            />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-foreground">
                {configService.getAppName()}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-2xs text-ink-faint">
                v{configService.getAppVersion()}
                <span className="size-1 rounded-full bg-success" aria-hidden="true" />
                <span>Self-hosted</span>
              </span>
            </span>
          ) : null}
        </Link>

        <nav aria-label="Main navigation" className="mt-1">
          <SectionLabel collapsed={collapsed}>Workspace</SectionLabel>
          <div className="space-y-1">
            {workspaceItems.map((item) => (
              <SidebarNavItem
                key={item.path}
                item={item}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </nav>

        {adminItems.length > 0 ? (
          <nav aria-label="Administration" className="mt-1">
            <SectionLabel collapsed={collapsed}>Manage</SectionLabel>
            <div className="space-y-1">
              {adminItems.map((item) => (
                <SidebarNavItem
                  key={item.path}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </nav>
        ) : null}

        <div className="mt-4 border-t border-sidebar-border pt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                aria-label={collapsed ? "Help" : undefined}
                title={collapsed ? "Help" : undefined}
                className={cn(
                  "h-11 w-full justify-start gap-3 rounded-sm px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <CircleHelp size={18} strokeWidth={1.75} aria-hidden="true" />
                {!collapsed ? (
                  <>
                    <span>Help</span>
                    <ChevronDown size={14} className="ml-auto" aria-hidden="true" />
                  </>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side={collapsed ? "right" : "bottom"} align="start">
              <DropdownMenuItem onClick={onAbout}>
                <Info size={14} aria-hidden="true" />
                About
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="mb-2 flex items-center justify-between px-1 font-mono text-2xs text-ink-faint">
            <span>{today}</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
              Private
            </span>
          </div>
        ) : (
          <div className="mb-2 flex justify-center">
            <span className="h-px w-6 bg-border" aria-hidden="true" />
          </div>
        )}

        <SidebarUserMenu
          collapsed={collapsed}
          displayName={displayName}
          onSettings={onSettings}
          onLogOut={onLogOut}
        />
      </div>
    </div>
  );
}
