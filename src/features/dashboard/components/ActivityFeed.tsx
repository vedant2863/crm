"use client";

import { Activity, UserPlus, Briefcase, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading: boolean;
}

function getIconConfig(type: string) {
  switch (type) {
    case "contact":
      return { Icon: UserPlus, color: "text-indigo-500", bg: "bg-indigo-500/10" };
    case "deal":
      return { Icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10" };
    case "task":
      return { Icon: CheckCircle2, color: "text-violet-500", bg: "bg-violet-500/10" };
    default:
      return { Icon: Clock, color: "text-muted-foreground", bg: "bg-muted/50" };
  }
}

export default function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  if (loading) return <Skeleton className="h-full w-full rounded-3xl" />;

  return (
    <div className="rounded-3xl border bg-card/60 backdrop-blur-sm p-5 flex flex-col gap-4">
      <h3 className="font-black text-foreground flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" /> Recent Activity
      </h3>

      <div className="relative space-y-4 before:absolute before:left-4 before:top-1 before:bottom-1 before:w-px before:bg-muted/50">
        {activities.length === 0 ? (
          <p className="text-sm italic text-muted-foreground text-center py-8">
            No recent activity
          </p>
        ) : (
          activities.slice(0, 7).map((a) => {
            const { Icon, color, bg } = getIconConfig(a.type);
            return (
              <div
                key={a.id}
                className="relative flex items-start gap-3 hover:translate-x-0.5 transition-transform"
              >
                <div
                  className={cn(
                    "relative z-10 p-2 rounded-full ring-4 ring-background shrink-0",
                    bg,
                    color
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-medium leading-snug">{a.description}</p>
                  <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                    {a.timestamp}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
