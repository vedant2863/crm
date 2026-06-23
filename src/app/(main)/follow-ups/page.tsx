"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/no-unused-vars */

import { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Plus, CheckCircle2, AlertCircle, Calendar, Clock,
  ChevronDown, AlertTriangle, ArrowUpRight, Search, 
  Trash2, Edit, Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks, Task } from "@/features/tasks";
import { TaskDialog } from "@/features/tasks/components/TaskDialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function FollowUpsPage() {
  const { status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch all tasks for this user
  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks({
    limit: 200, // Fetch all tasks so we can group them locally
  });

  const handleOpenDialog = (task: Task | null = null) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id, data);
        toast.success("Task updated");
      } else {
        await createTask(data);
        toast.success("Task created");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save task");
    }
  };

  const handleToggleStatus = async (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await updateTask(taskId, { status: nextStatus });
      toast.success(nextStatus === "completed" ? "Marked as completed" : "Marked as pending");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task");
    }
  };

  if (status === "loading" || (loading && tasks.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-4 w-full rounded-full" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">Please log in to manage follow-up tasks.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Error Loading Tasks</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Filter tasks locally by search term
  const filteredTasks = tasks.filter(task => {
    const term = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(term) ||
      (task.description && task.description.toLowerCase().includes(term))
    );
  });

  // Today/Overdue/Upcoming/Completed Logic
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const overdueList: Task[] = [];
  const todayList: Task[] = [];
  const upcomingList: Task[] = [];
  const completedList: Task[] = [];

  filteredTasks.forEach(task => {
    if (task.status === "completed" || task.status === "cancelled") {
      completedList.push(task);
      return;
    }

    if (!task.dueDate) {
      upcomingList.push(task);
      return;
    }

    const dueDate = new Date(task.dueDate);
    if (dueDate < todayStart) {
      overdueList.push(task);
    } else if (dueDate >= todayStart && dueDate <= todayEnd) {
      todayList.push(task);
    } else {
      upcomingList.push(task);
    }
  });

  // Calculate completion progress
  const activeCount = tasks.filter(t => t.status !== "completed" && t.status !== "cancelled").length;
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const totalCount = activeCount + completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground mt-1">Track due dates, stay on top of client commitments.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-4 w-4 mr-2" /> Add Follow-up
        </Button>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span>Task Completion Progress</span>
          <span className="text-primary font-black">{progressPercent}% ({completedCount} of {totalCount} completed)</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3.5 overflow-hidden">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search follow-ups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grouped Lists */}
      <div className="space-y-6">

        {/* Overdue */}
        {overdueList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 fill-current" /> Overdue
            </h2>
            <div className="flex flex-col gap-3">
              {overdueList.map(task => (
                <FollowUpCard 
                  key={task._id} 
                  task={task} 
                  onToggleStatus={handleToggleStatus} 
                  onEdit={handleOpenDialog} 
                  onDelete={handleDelete}
                  badgeStyle="bg-rose-500/10 text-rose-600 border-rose-500/20"
                />
              ))}
            </div>
          </div>
        )}

        {/* Today */}
        {todayList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Due Today
            </h2>
            <div className="flex flex-col gap-3">
              {todayList.map(task => (
                <FollowUpCard 
                  key={task._id} 
                  task={task} 
                  onToggleStatus={handleToggleStatus} 
                  onEdit={handleOpenDialog} 
                  onDelete={handleDelete}
                  badgeStyle="bg-amber-500/10 text-amber-600 border-amber-500/20"
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Upcoming
          </h2>
          <div className="flex flex-col gap-3">
            {upcomingList.map(task => (
              <FollowUpCard 
                key={task._id} 
                task={task} 
                onToggleStatus={handleToggleStatus} 
                onEdit={handleOpenDialog} 
                onDelete={handleDelete}
                badgeStyle="bg-blue-500/10 text-blue-600 border-blue-500/20"
              />
            ))}
          </div>
          {upcomingList.length === 0 && todayList.length === 0 && overdueList.length === 0 && (
            <div className="text-center py-12 bg-card/40 border rounded-2xl border-dashed">
              <CheckCircle2 className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground font-medium">No active tasks</p>
            </div>
          )}
        </div>

        {/* Completed */}
        {completedList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </h2>
            <div className="flex flex-col gap-3 opacity-60">
              {completedList.map(task => (
                <FollowUpCard 
                  key={task._id} 
                  task={task} 
                  onToggleStatus={handleToggleStatus} 
                  onEdit={handleOpenDialog} 
                  onDelete={handleDelete}
                  badgeStyle="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingTask}
      />
    </div>
  );
}

interface FollowUpCardProps {
  task: Task;
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  badgeStyle: string;
}

function FollowUpCard({ task, onToggleStatus, onEdit, onDelete, badgeStyle }: FollowUpCardProps) {
  const isCompleted = task.status === "completed" || task.status === "cancelled";
  
  return (
    <div className="group relative bg-card border rounded-3xl p-5 hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex items-center gap-4">
      {/* Checkbox button */}
      <button 
        onClick={() => onToggleStatus(task._id)}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
          isCompleted 
            ? "bg-emerald-500 border-emerald-500 text-white" 
            : "border-muted-foreground/30 hover:border-primary hover:bg-primary/5 text-transparent"
        )}
      >
        <Check className="h-3.5 w-3.5 font-bold" />
      </button>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-bold text-sm text-foreground truncate",
          isCompleted && "line-through text-muted-foreground"
        )}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-xl">
            {task.description}
          </p>
        )}
      </div>

      {/* Badges / Dates */}
      <div className="flex items-center gap-3 shrink-0">
        {task.dueDate && (
          <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border", badgeStyle)}>
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}

        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border",
          task.priority === "high" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
          task.priority === "medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
          "bg-gray-500/10 text-gray-600 border-gray-500/20"
        )}>
          {task.priority}
        </span>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Edit Task"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
            title="Delete Task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
