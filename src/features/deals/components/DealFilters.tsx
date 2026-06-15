"use client";

import { Search, LayoutList, Kanban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface DealFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    selectedStage: string;
    setSelectedStage: (value: string) => void;
    viewMode: "list" | "pipeline";
    setViewMode: (mode: "list" | "pipeline") => void;
    stages: { key: string; label: string }[];
}

export function DealFilters({
    searchTerm,
    setSearchTerm,
    selectedStage,
    setSelectedStage,
    viewMode,
    setViewMode,
    stages,
}: DealFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search deals, contacts, or companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-background border-none ring-1 ring-border"
                />
            </div>

            <div className="flex gap-3 w-full md:w-auto">
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger className="w-full md:w-[150px] bg-background border-none ring-1 ring-border">
                        <SelectValue placeholder="All Stages" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Stages</SelectItem>
                        {stages.map((s) => (
                            <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex p-1 bg-muted rounded-lg border shadow-inner">
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={`px-3 py-1 h-8 rounded-md ${viewMode === "list" ? "bg-background shadow-sm" : ""}`}
                    >
                        <LayoutList className="h-4 w-4 mr-2" /> List
                    </Button>
                    <Button
                        variant={viewMode === "pipeline" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("pipeline")}
                        className={`px-3 py-1 h-8 rounded-md ${viewMode === "pipeline" ? "bg-background shadow-sm" : ""}`}
                    >
                        <Kanban className="h-4 w-4 mr-2" /> Pipeline
                    </Button>
                </div>
            </div>
        </div>
    );
}
