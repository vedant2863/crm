"use client";

import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "./ui/sidebar";
import { Toaster } from "react-hot-toast";

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
      {children}
      <Toaster position="top-right" />
    </SessionProvider>
  );
}
