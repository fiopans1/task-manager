import React from "react";
import { Button } from "react-bootstrap";
import { useTheme } from "../../context/ThemeContext";

/**
 * Floating theme toggle button for public/auth pages.
 * Renders a small circular button at the bottom-left corner.
 */
function ThemeToggleButton() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <Button
      variant={darkMode ? "light" : "dark"}
      onClick={toggleDarkMode}
      className="position-fixed rounded-circle d-flex align-items-center justify-content-center shadow"
      style={{ bottom: "1.5rem", left: "1.5rem", width: "3rem", height: "3rem", zIndex: 1050 }}
      aria-label="Toggle dark mode"
    >
      <i className={`bi ${darkMode ? "bi-sun-fill" : "bi-moon-fill"}`} aria-hidden="true"></i>
    </Button>
  );
}

export default ThemeToggleButton;
