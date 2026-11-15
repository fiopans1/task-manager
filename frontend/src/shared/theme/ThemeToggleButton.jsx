import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { Button } from "@/shared/ui/button";

/**
 * Floating theme switch used on public and auth screens.
 */
export function ThemeToggleButton() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleDarkMode}
      aria-label="Toggle dark mode"
      className="fixed bottom-5 right-5 z-40 rounded-full bg-background/90 shadow-overlay backdrop-blur"
    >
      {darkMode ? <Sun size={17} /> : <Moon size={17} />}
    </Button>
  );
}

export default ThemeToggleButton;
