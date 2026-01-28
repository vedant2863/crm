"use client";

import { useSession } from "next-auth/react";
import WelcomeSection from "@/feature/dashboard/components/shared/WelcomeSection";
import QuickActions from "@/feature/dashboard/components/shared/QuickActions";
import KpiWidget from "@/feature/dashboard/components/widgets/KpiWidget";
import PipelineWidget from "@/feature/dashboard/components/widgets/PipelineWidget";
import ActivityWidget from "@/feature/dashboard/components/widgets/ActivityWidget";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <WelcomeSection name={session?.user?.name} />

      <KpiWidget />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineWidget />
        <ActivityWidget />
      </div>

      <QuickActions />
    </div>
  );
}
