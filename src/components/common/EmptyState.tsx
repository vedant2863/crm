"use client";

import type { ComponentType, ReactNode } from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?:
    | {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
      }
    | ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const isActionObject =
    action && typeof action === "object" && "label" in action && "onClick" in action;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/60 bg-card/40 backdrop-blur-sm animate-in fade-in-50 duration-300",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border/40 flex items-center justify-center text-muted-foreground mb-4 shadow-inner">
        <Icon className="h-7 w-7 text-muted-foreground/80" />
      </div>

      <h3 className="text-lg font-bold text-foreground mb-1.5">{title}</h3>

      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <div>
          {isActionObject ? (
            <Button
              onClick={(action as any).onClick}
              className="gap-2 shadow-sm font-semibold"
            >
              {(action as any).icon &&
                React.createElement((action as any).icon, {
                  className: "h-4 w-4",
                })}
              {(action as any).label}
            </Button>
          ) : (
            (action as React.ReactNode)
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
