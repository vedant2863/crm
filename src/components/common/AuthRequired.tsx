"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AuthRequiredProps {
  title?: string;
  description?: string;
  loginUrl?: string;
  className?: string;
}

export function AuthRequired({
  title = "Authentication Required",
  description = "Please log in with your credentials to access this workspace.",
  loginUrl = "/login",
  className,
}: AuthRequiredProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[50vh] p-8 text-center",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 shadow-sm border border-primary/20">
        <Lock className="h-6 w-6" />
      </div>

      <h2 className="text-2xl font-black tracking-tight text-foreground mb-2">
        {title}
      </h2>

      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      <Button asChild className="gap-2 shadow-lg shadow-primary/20 font-bold">
        <Link href={loginUrl}>
          Log In <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

export default AuthRequired;
