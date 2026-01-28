"use client";

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, UserPlus, Briefcase, CheckCircle2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

type Activity = {
  id: string;
  type: string;
  description: string;
  timestamp: string;
};

export default function RecentActivity({
  activities,
}: {
  activities: Activity[];
}) {
  const getIconConfig = (type: string) => {
    switch (type) {
      case "contact":
        return { icon: UserPlus, color: "text-blue-600", bgColor: "bg-blue-50" };
      case "deal":
        return { icon: Briefcase, color: "text-emerald-600", bgColor: "bg-emerald-50" };
      case "task":
        return { icon: CheckCircle2, color: "text-purple-600", bgColor: "bg-purple-50" };
      default:
        return { icon: Clock, color: "text-muted-foreground", bgColor: "bg-muted" };
    }
  };

  return (
    <Card className="border shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your workspace</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
          {activities.length === 0 ? (
            <div className="text-center py-10 italic text-muted-foreground text-sm">
              No recent activity to show.
            </div>
          ) : (
            activities.map((activity) => {
              const config = getIconConfig(activity.type);
              return (
                <div key={activity.id} className="relative flex items-start gap-4 transition-all hover:translate-x-1">
                  <div className={`relative z-10 p-2.5 rounded-full ${config.bgColor} ${config.color} ring-4 ring-background`}>
                    <config.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1 pt-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {activities.length > 0 && (
          <Button variant="ghost" className="w-full mt-6 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5">
            View All Activity
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

