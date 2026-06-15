"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useDashboardPipeline } from "../../hooks/useDashboardPipeline";

export default function WelcomeSection({ name }: { name?: string | null }) {
  const [greeting, setGreeting] = useState("Welcome back");
  const [time, setTime] = useState(new Date());
  const { pipelineStats } = useDashboardPipeline();
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else if (hour < 22) setGreeting("Good evening");
    else setGreeting("Good night");

    const timer = setInterval(() => setTime(new Date()), 1000);

    // Fetch task stats
    fetch("/api/dashboard/tasks-stats")
      .then(res => res.json())
      .then(data => {
        const count = data.taskStats?.todo || 0;
        setTaskCount(count);
      })
      .catch(console.error);

    return () => clearInterval(timer);
  }, []);

  const pendingDeals = pipelineStats
    .filter(s => ["New", "Contacted", "Qualified", "Proposal", "Negotiation"].includes(s.stage))
    .reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="relative overflow-hidden bg-card/35 backdrop-blur-md border border-border/30 rounded-3xl p-5 shadow-sm transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary animate-pulse shrink-0">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              {greeting}, <span className="text-primary font-black">{name?.split(' ')[0] || "Partner"}</span>!
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-0.5 font-medium">
              You have <span className="text-foreground font-bold underline decoration-primary/30 underline-offset-2">{pendingDeals} pending deals</span> and <span className="text-foreground font-bold underline decoration-primary/30 underline-offset-2">{taskCount} urgent tasks</span> today.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end shrink-0 bg-background/40 border border-border/10 px-3.5 py-2 rounded-2xl shadow-sm">
          <div className="text-lg font-black tracking-tighter text-foreground tabular-nums">
            {format(time, "HH:mm:ss")}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
            {format(time, "EEEE, MMMM do")}
          </div>
        </div>
      </div>
      
      {/* Subtle radial light glow in the corner */}
      <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
    </div>
  );
}


