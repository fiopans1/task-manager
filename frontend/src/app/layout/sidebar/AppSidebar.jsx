import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "@/shared/lib/icons";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { useNavigationItems } from "@/app/layout/useNavigationItems";
import SidebarContent from "@/app/layout/sidebar/SidebarContent";
import MobileHeader from "@/app/layout/sidebar/MobileHeader";
import MobileNav from "@/app/layout/sidebar/MobileNav";
import AboutDialog from "@/app/layout/AboutDialog";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

export default function AppSidebar({ onLogOut }) {
  const { items, displayName } = useNavigationItems();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  const sharedProps = {
    items,
    displayName,
    today,
    onAbout: () => setAboutOpen(true),
    onSettings: () => navigate("/home/settings"),
    onLogOut,
  };

  if (isMobile) {
    return (
      <>
        <MobileHeader onOpenMenu={() => setMobileOpen(true)} />
        <MobileNav
          open={mobileOpen}
          onOpenChange={setMobileOpen}
          items={items}
          displayName={displayName}
          onAbout={() => setAboutOpen(true)}
          onSettings={() => navigate("/home/settings")}
          onLogOut={onLogOut}
        />
        <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
      </>
    );
  }

  return (
    <>
      <aside
        id="desktop-sidebar"
        className={cn(
          "relative sticky top-0 flex h-dvh w-[268px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
          collapsed && "collapsed w-[84px]",
        )}
        aria-label="Application sidebar"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={GRID_STYLE}
        />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <SidebarContent {...sharedProps} collapsed={collapsed} />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-controls="desktop-sidebar"
          className="absolute -right-3 top-5 z-20 rounded-full border-border bg-card text-muted-foreground shadow-overlay hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </Button>
      </aside>
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </>
  );
}
