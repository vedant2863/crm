"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "./ui/sidebar";
import { Toaster } from "react-hot-toast";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("crm-theme") as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(savedTheme);
    } else {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("crm-theme", newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>{children}</SidebarProvider>
      <Toaster position="top-right" />
    </SessionProvider>
  );
}

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <Toaster position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  );
}
