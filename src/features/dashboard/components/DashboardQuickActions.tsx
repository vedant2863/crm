"use client";

import { UserPlus, Briefcase, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const ACTIONS = [
  {
    label: "New Contact",
    desc: "Grow your network",
    icon: UserPlus,
    color: "#6366f1",
    url: "/contacts",
  },
  {
    label: "Start Deal",
    desc: "Close more sales",
    icon: Briefcase,
    color: "#10b981",
    url: "/deals",
  },
  {
    label: "Add Task",
    desc: "Stay organised",
    icon: CheckCircle2,
    color: "#8b5cf6",
    url: "/tasks",
  },
];

export default function DashboardQuickActions() {
  const router = useRouter();

  return (
    <div className="rounded-3xl border bg-card/60 backdrop-blur-sm p-5 flex flex-col gap-4">
      <h3 className="font-black text-foreground flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" /> Quick Actions
      </h3>

      <div className="space-y-2">
        {ACTIONS.map(({ label, desc, icon: Icon, color, url }) => (
          <button
            key={label}
            onClick={() => router.push(url)}
            className="group w-full flex items-center justify-between p-3.5 rounded-2xl bg-background/40 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: `${color}18` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
