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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      url: "/contacts",
    },
    {
      label: "Start Deal",
      description: "Close more sales",
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      url: "/deals",
    },
    {
      label: "Assign Task",
      description: "Stay organized",
      icon: CheckCircle2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      url: "/tasks",
    },
  ];

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
        <CardDescription>Common tasks to jumpstart your productivity.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action) => (
            <div
              key={action.label}
              onClick={() => router.push(action.url)}
              className="group relative bg-card border rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:border-primary/20 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${action.bgColor} ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg">{action.label}</h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/5 group-hover:ring-primary/20 transition-all" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

