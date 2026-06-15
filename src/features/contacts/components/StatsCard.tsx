import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number;
  icon?: ReactNode;
  valueColor?: string;
  bgColor?: string;
  dotColor?: string;
}

export default function StatsCard({
  label,
  value,
  icon,
  valueColor = "text-foreground",
  bgColor,
  dotColor,
}: StatsCardProps) {
  return (
    <Card className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm p-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={cn("text-3xl font-black tracking-tight", valueColor)}>{value}</p>
          </div>
          {icon ? (
            <div className="p-3 rounded-2xl bg-primary/5 text-primary">
              {icon}
            </div>
          ) : bgColor && dotColor ? (
            <div
              className={`h-10 w-10 ${bgColor} rounded-2xl flex items-center justify-center`}
            >
              <div className={`h-3 w-3 ${dotColor} rounded-full animate-pulse`}></div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
