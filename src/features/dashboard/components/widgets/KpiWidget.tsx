"use client";

import { useDashboardKpis } from "../../hooks/useDashboardKpis";
import KpiCard from "../../components/KpiCard";
import { Users, Target, DollarSign, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function KpiWidget() {
    const { stats, loading, error } = useDashboardKpis();

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-destructive">Failed to load KPIs</div>;
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard
                label="Total Contacts"
                stats={stats.totalContacts}
                icon={Users}
                subtitle="+12 from last month"
                trend={{ value: "12%", direction: "up", label: "vs last month" }}
            />
            <KpiCard
                label="Total Deals"
                stats={stats.totalDeals}
                icon={Target}
                trend={{ value: "5%", direction: "down", label: "vs last month" }}
            />
            <KpiCard
                label="Total Revenue"
                stats={`$${stats.totalRevenue.toLocaleString()}`}
                icon={DollarSign}
                trend={{ value: "18%", direction: "up", label: "vs last month" }}
            />
            <KpiCard
                label="Conversion Rate"
                stats={`${stats.conversionRate}%`}
                icon={TrendingUp}
                trend={{ value: "2.3%", direction: "up", label: "vs last month" }}
            />
        </div>
    );
}
