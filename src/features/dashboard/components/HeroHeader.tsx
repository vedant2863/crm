"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

interface HeroHeaderProps {
  name?: string | null;
}

export default function HeroHeader({ name }: HeroHeaderProps) {
  const [now, setNow] = useState(new Date());
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    fetch("/api/dashboard/tasks-stats")
      .then(r => r.json())
      .then(d => setTaskCount(d.taskStats?.todo ?? 0))
      .catch(() => {});
    return () => clearInterval(t);
  }, []);

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 18 ? "Good afternoon" :
    hour < 22 ? "Good evening" : "Good night";
  const emoji =
    hour < 12 ? "🌅" :
    hour < 18 ? "☀️" :
    hour < 22 ? "🌆" : "🌙";

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 md:p-8"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.55 0.18 260 / 0.9) 0%, oklch(0.45 0.22 290 / 0.85) 50%, oklch(0.50 0.20 240 / 0.9) 100%)",
      }}
    >
      {/* Animated blobs */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
      <div className="pointer-events-none absolute top-4 right-1/3 h-24 w-24 rounded-full bg-white/5 blur-2xl" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left — greeting */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur-sm ring-1 ring-white/20">
            {emoji}
          </div>
          <div>
            <p className="text-sm font-semibold text-white/70 uppercase tracking-widest">
              {format(now, "EEEE, MMMM do")}
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {greeting},{" "}
              <span className="text-white/90">{name?.split(" ")[0] ?? "Partner"}</span>!
            </h1>
            {taskCount > 0 && (
              <p className="mt-1 text-sm text-white/70">
                You have{" "}
                <span className="font-bold text-white">
                  {taskCount} task{taskCount > 1 ? "s" : ""}
                </span>{" "}
                pending today.
              </p>
            )}
          </div>
        </div>

        {/* Right — live clock */}
        <div className="flex shrink-0 flex-col items-start md:items-end rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-sm ring-1 ring-white/15">
          <span className="text-3xl font-black tabular-nums tracking-tighter text-white">
            {format(now, "HH:mm:ss")}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mt-0.5">
            Local time
          </span>
        </div>
      </div>
    </div>
  );
}
