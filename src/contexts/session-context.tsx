"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { Session, SessionContextType } from "@/types/session";

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return { data: context.session, status: context.status };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<SessionContextType["status"]>("loading");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;

        if (data?.user) {
          setSession(data);
          setStatus("authenticated");
        } else {
          setSession(null);
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        if (cancelled) return;

        setSession(null);
        setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        status,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
