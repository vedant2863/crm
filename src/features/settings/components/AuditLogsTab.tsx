"use client";

import { useEffect, useState } from "react";
import {
  fetchAuditLogs,
  ClientAuditLog,
} from "@/features/enterprise/services/enterprise-client-service";
import { ShieldAlert, ShieldCheck, Clock, User, Globe } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLogsTab() {
  const [logs, setLogs] = useState<ClientAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAuditLogs();
        setLogs(data);
      } catch (err: unknown) {
        console.error("Error loading audit logs:", err);
        const errMsg = err instanceof Error ? err.message : "";
        if (errMsg === "UNAUTHORIZED") {
          setError(
            "Forbidden: You do not have permission to view security audit logs."
          );
        } else {
          setError("Failed to load audit logs. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 animate-pulse" /> Access Denied
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-card/45 border backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black">
          <ShieldCheck className="h-5 w-5 text-primary" /> Security Audit Logs
        </CardTitle>
        <CardDescription>
          Chronological record of system security, modification, and login activities. (Admins only)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-8">
            No audit logs recorded yet.
          </p>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {logs.map((log) => (
              <div
                key={log._id}
                className="flex items-start gap-4 p-3 rounded-2xl bg-muted/20 border border-border/30 hover:border-primary/10 transition-all duration-300 text-xs"
              >
                <div className="p-2 rounded-xl bg-primary/10 text-primary mt-0.5 shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-foreground truncate">
                      {log.userName}
                    </span>
                    <span className="text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-muted-foreground font-medium mb-2 leading-relaxed">
                    {log.details}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground/60 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(log.createdAt).toLocaleDateString()} at{" "}
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {log.ipAddress && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" />
                        IP: {log.ipAddress}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
