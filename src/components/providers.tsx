"use client";

import { Toaster } from "react-hot-toast";

import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "@/contexts/session-context";
import { ThemeProvider, useTheme } from "@/contexts/theme-context";

export { useTheme };

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <SidebarProvider>{children}</SidebarProvider>

        <Toaster position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  );
}
