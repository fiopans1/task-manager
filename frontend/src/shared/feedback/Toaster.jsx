import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/shared/theme/ThemeProvider";

/**
 * Single toast mount point. All app code goes through shared/feedback/Noty.js.
 */
export function Toaster() {
  const { darkMode } = useTheme();

  return (
    <SonnerToaster
      position="bottom-right"
      theme={darkMode ? "dark" : "light"}
      closeButton
      richColors={false}
      duration={3000}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-md !border !border-border !bg-popover !text-popover-foreground !shadow-overlay",
          title: "!text-sm !font-medium",
          description: "!text-xs !text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-surface-2 !text-foreground",
          closeButton: "!border-border !bg-popover !text-muted-foreground",
        },
      }}
    />
  );
}
