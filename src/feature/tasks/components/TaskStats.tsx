"use client";

import { CheckCircle2, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TaskStatsProps {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
}

export function TaskStats({ total, pending, inProgress, completed }: TaskStatsProps) {
    const stats = [
        { label: "Total Tasks", value: total, icon: CheckCircle2, color: "text-blue-600", bgColor: "bg-blue-50" },
        { label: "Pending", value: pending, icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-50" },
        { label: "In Progress", value: inProgress, icon: AlertCircle, color: "text-indigo-600", bgColor: "bg-indigo-50" },
        { label: "Completed", value: completed, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="border-none shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
