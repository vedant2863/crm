"use client";

import { Task } from "../types/task";
import { CheckCircle2, Calendar, User, Flag, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface TaskItemProps {
    task: Task;
    onToggleStatus: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
}

export function TaskItem({ task, onToggleStatus, onDelete, onEdit }: TaskItemProps) {
    const isCompleted = task.status === "completed";
    const overdue = task.dueDate && !isCompleted && new Date(task.dueDate) < new Date();

    const priorityColors = {
        low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        high: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    };

    const statusColors = {
        pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        in_progress: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        cancelled: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };

    return (
        <div className={`group relative bg-card border rounded-xl p-5 transition-all hover:shadow-md hover:border-primary/20 ${isCompleted ? "opacity-60" : ""} ${overdue ? "border-l-4 border-l-destructive" : ""}`}>
            <div className="flex items-start gap-4">
                <button
                    onClick={() => onToggleStatus(task._id)}
                    className={`shrink-0 mt-1 p-1 rounded-full border-2 transition-all ${isCompleted
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30 text-transparent hover:border-primary/50"
                        }`}
                >
                    <CheckCircle2 className="h-4 w-4 fill-current" />
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className={`text-base font-semibold truncate ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {task.title}
                        </h3>
                        <Badge variant="secondary" className={`text-[10px] uppercase tracking-wider font-bold border-none ${statusColors[task.status as keyof typeof statusColors]}`}>
                            {task.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="secondary" className={`text-[10px] uppercase tracking-wider font-bold border-none ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                            {task.priority}
                        </Badge>
                        {overdue && (
                            <Badge variant="destructive" className="text-[10px] uppercase tracking-wider font-bold animate-pulse">
                                Overdue
                            </Badge>
                        )}
                    </div>

                    {task.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {task.description}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                        {task.dueDate && (
                            <div className="flex items-center gap-1.5 font-medium">
                                <Calendar className={`h-3.5 w-3.5 ${overdue ? "text-destructive" : ""}`} />
                                <span className={overdue ? "text-destructive" : ""}>
                                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        )}
                        {task.contactId && (
                            <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[150px]">{task.contactId.name}</span>
                            </div>
                        )}
                        {task.dealId && (
                            <div className="flex items-center gap-1.5">
                                <Flag className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[150px]">{task.dealId.title}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => onEdit(task)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleStatus(task._id)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> {isCompleted ? "Mark Pending" : "Mark Done"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(task._id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
