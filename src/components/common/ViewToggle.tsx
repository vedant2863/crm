"use client";

import type { ComponentType } from "react";
import { Table, LayoutGrid, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ViewToggleOption<T extends string = string> {
  value: T;
  label?: string;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
}

export interface ViewToggleProps<T extends string = string> {
  mode: T;
  onChange: (mode: T) => void;
  options?: ViewToggleOption<T>[];
  className?: string;
}

const DEFAULT_OPTIONS: ViewToggleOption[] = [
  { value: "table", label: "Table", icon: Table },
  { value: "card", label: "Grid", icon: LayoutGrid },
];

export function ViewToggle<T extends string = string>({
  mode,
  onChange,
  options = DEFAULT_OPTIONS as ViewToggleOption<T>[],
  className,
}: ViewToggleProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border/50",
        className
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = mode === opt.value;
        return (
          <Button
            key={opt.value}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-8 px-2.5 rounded-lg text-xs font-semibold gap-1.5 transition-all duration-200",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-transparent"
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {opt.label && <span>{opt.label}</span>}
          </Button>
        );
      })}
    </div>
  );
}

export default ViewToggle;
