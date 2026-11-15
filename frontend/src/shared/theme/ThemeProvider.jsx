import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const THEME_KEY = "app-theme";

function getInitialTheme() {
  if (typeof window === "undefined") return false;

  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === "dark") return true;
  if (saved === "light") return false;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyTheme(darkMode) {
  const theme = darkMode ? "dark" : "light";
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", darkMode ? "#080D12" : "#F2F4F7");
  }
}

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(darkMode);
    window.localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((current) => !current);
  }, []);

  const value = useMemo(
    () => ({ darkMode, setDarkMode, toggleDarkMode }),
    [darkMode, toggleDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
