import { Menu } from "@/shared/lib/icons";
import configService from "@/services/configService";
import { Button } from "@/shared/ui/button";

export default function MobileHeader({ onOpenMenu }) {
  return (
    <header className="sticky top-0 z-40 flex min-h-14 items-center gap-3 border-b border-border bg-background/95 px-3 pt-safe backdrop-blur md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onOpenMenu}
        aria-controls="sidebar-menu"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </Button>
      <div className="flex min-w-0 items-center gap-2">
        <img src="/favicon.png" alt="" width={24} height={24} className="size-6 object-contain" />
        <span className="truncate text-sm font-semibold tracking-tight text-foreground">
          {configService.getAppName()}
        </span>
      </div>
    </header>
  );
}
