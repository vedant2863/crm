# Component Template

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomComponentProps {
  title: string;
  className?: string;
}

export function CustomComponent({ title, className }: CustomComponentProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl bg-card/45 backdrop-blur-md border border-border/50 shadow-xl",
        className
      )}
    >
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
    </div>
  );
}
```
