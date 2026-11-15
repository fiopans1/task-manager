import { NavLink } from "react-router-dom";
import { CircleHelp, LogOut, Moon, Settings, Sun } from "@/shared/lib/icons";
import { useTheme } from "@/shared/theme/ThemeProvider";
import configService from "@/services/configService";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { Switch } from "@/shared/ui/switch";
import { cn } from "@/shared/lib/utils";

export default function MobileNav({
  open,
  onOpenChange,
  items,
  displayName,
  onAbout,
  onSettings,
  onLogOut,
}) {
  const { darkMode, toggleDarkMode } = useTheme();

  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent id="sidebar-menu" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
          <div className="flex items-center gap-2.5 px-2 pb-4">
            <img src="/favicon.png" alt="" width={30} height={30} className="size-[30px]" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                {configService.getAppName()}
              </p>
              <p className="font-mono text-2xs text-ink-faint">
                v{configService.getAppVersion()}
              </p>
            </div>
          </div>

          <nav aria-label="Main navigation" className="space-y-1">
            {items.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={close}
                  className={({ isActive }) =>
                    cn(
                      "flex h-10 items-center gap-3 rounded-sm px-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-soft text-brand"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )
                  }
                >
                  <IconComponent size={18} strokeWidth={1.75} aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => {
                close();
                onAbout();
              }}
              className="flex h-10 w-full items-center gap-3 rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <CircleHelp size={18} strokeWidth={1.75} aria-hidden="true" />
              Help
            </button>
          </div>

          <div className="mt-auto space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-3 px-2">
              <span className="flex items-center gap-2 text-sm text-foreground">
                {darkMode ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
                Dark mode
              </span>
              <Switch
                id="mobile-dark-mode-switch"
                checked={darkMode}
                onChange={toggleDarkMode}
                aria-label="Dark mode"
              />
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                close();
                onSettings();
              }}
            >
              <Settings size={15} aria-hidden="true" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-danger hover:bg-danger-soft hover:text-danger"
              onClick={onLogOut}
            >
              <LogOut size={15} aria-hidden="true" />
              Log Out
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
            <Avatar name={displayName} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-2xs text-muted-foreground">Account</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
