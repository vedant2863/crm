"use client";

import { Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userName?: string | null;
  onRefreshAll: () => void;
}

export function DashboardHeader({ userName, onRefreshAll }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Welcome Back, <span className="text-primary italic">{userName || "Partner"}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Here is an overview of your sales ecosystem today.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center border rounded-full px-4 py-2 bg-card text-xs font-bold text-muted-foreground shadow-sm">
          <Calendar className="h-3.5 w-3.5 mr-2" /> 01 Jan - 21 Jun, 2026
        </div>
        <Button
          onClick={onRefreshAll}
          variant="outline"
          size="icon"
          className="rounded-full shadow-sm"
          title="Refresh Dashboard"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
