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
    <div className="relative mb-10 group">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
            {greeting}, <span className="text-primary">{name?.split(' ')[0] || "Partner"}</span>!
          </h1>
          <p className="text-muted-foreground text-lg mt-2 font-medium max-w-xl">
            You have <span className="text-foreground font-bold underline decoration-primary/30 underline-offset-4">{pendingDeals} pending deals</span> and <span className="text-foreground font-bold underline decoration-primary/30 underline-offset-4">{taskCount} urgent tasks</span> today.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end">
          <div className="text-2xl font-black tracking-tighter tabular-nums">
            {format(time, "HH:mm:ss")}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {format(time, "EEEE, MMMM do")}
          </div>
        </div>
      </div>

      {/* Decorative accent */}
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-primary rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}


