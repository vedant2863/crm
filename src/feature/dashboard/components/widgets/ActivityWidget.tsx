"use client";

import { useDashboardActivities } from "../../hooks/useDashboardActivities";
import RecentActivity from "../shared/RecentActivity";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityWidget() {
    const { activities, loading, error } = useDashboardActivities();

    if (loading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    if (error) {
        return (
            <div className="h-[400px] flex items-center justify-center border rounded-xl bg-destructive/10 text-destructive">
                Failed to load Activity
            </div>
        );
    }

    return <RecentActivity activities={activities} />;
}
