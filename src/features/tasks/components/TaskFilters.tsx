"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    selectedStatus: string;
    setSelectedStatus: (value: string) => void;
    selectedPriority: string;
    setSelectedPriority: (value: string) => void;
    statuses: { key: string; label: string }[];
    priorities: { key: string; label: string }[];
}

export function TaskFilters({
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedPriority,
    setSelectedPriority,
    statuses,
    priorities,
}: TaskFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-background border-none ring-1 ring-border focus-visible:ring-2 focus-visible:ring-primary/20"
                />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full md:w-[150px] bg-background border-none ring-1 ring-border">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {statuses.map((s) => (
                            <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-full md:w-[150px] bg-background border-none ring-1 ring-border">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        {priorities.map((p) => (
                            <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
