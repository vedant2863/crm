"use client";

import { Toaster } from "react-hot-toast";

import { SessionProvider } from "@/contexts/session-context";
import { ThemeProvider, useTheme } from "@/contexts/theme-context";

export { useTheme };

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}

        <Toaster position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  );
}
