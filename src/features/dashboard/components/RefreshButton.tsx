"use client";

import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onRefresh: () => void;
  spinning: boolean;
}

export default function RefreshButton({ onRefresh, spinning }: RefreshButtonProps) {
  return (
    <button
      onClick={onRefresh}
      className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-primary/5 border border-transparent hover:border-primary/10"
    >
      <RefreshCw className={cn("h-3.5 w-3.5", spinning && "animate-spin")} />
      Refresh
    </button>
  );
}
