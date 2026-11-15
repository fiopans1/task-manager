import { ChevronUp, LogOut, Moon, Settings, Sun } from "@/shared/lib/icons";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { Avatar } from "@/shared/ui/avatar";
import { Switch } from "@/shared/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

export default function SidebarUserMenu({
  collapsed = false,
  displayName,
  onSettings,
  onLogOut,
}) {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          id="user-menu"
          className={cn(
            "flex w-full items-center gap-3 rounded-md border border-sidebar-border bg-surface-2/70 p-2 text-left transition-colors hover:bg-accent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
            collapsed && "justify-center border-transparent bg-transparent p-0 hover:bg-accent",
          )}
        >
          <Avatar name={displayName} size="sm" />
          {!collapsed ? (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {displayName}
                </span>
                <span className="block text-2xs text-muted-foreground">Account</span>
              </span>
              <ChevronUp size={14} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            </>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={collapsed ? "right" : "top"}
        align={collapsed ? "start" : "end"}
        className="w-64"
      >
        <DropdownMenuLabel className="truncate text-xs text-foreground">
          {displayName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between gap-3 px-2.5 py-2">
          <span className="flex items-center gap-2 text-sm text-foreground">
            {darkMode ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
            Dark mode
          </span>
          <Switch
            id="dark-mode-switch"
            checked={darkMode}
            onChange={toggleDarkMode}
            aria-label="Dark mode"
          />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem id="user-settings" onClick={onSettings}>
          <Settings size={14} aria-hidden="true" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onClick={onLogOut}>
          <LogOut size={14} aria-hidden="true" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
