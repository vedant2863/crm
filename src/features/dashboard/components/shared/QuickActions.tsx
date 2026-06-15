"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Users, Target, CheckCircle2, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      label: "New Contact",
      description: "Grow your network",
      icon: Users,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/15",
      url: "/contacts",
    },
    {
      label: "Start Deal",
      description: "Close more sales",
      icon: Target,
      color: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/15",
      url: "/deals",
    },
    {
      label: "Assign Task",
      description: "Stay organized",
      icon: CheckCircle2,
      color: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/15",
      url: "/tasks",
    },
  ];

  return (
    <Card className="border shadow-sm rounded-2xl overflow-hidden">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks to jumpstart productivity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.label}
              onClick={() => router.push(action.url)}
              className="group flex items-center justify-between p-4 bg-card border rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:translate-x-1"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${action.bgColor} ${action.color} transition-colors duration-300`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{action.label}</h4>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

