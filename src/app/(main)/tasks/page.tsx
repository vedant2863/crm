"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "@/hooks/useTasks";
import { TaskStats } from "@/feature/tasks/components/TaskStats";
import { TaskFilters } from "@/feature/tasks/components/TaskFilters";
import { TaskItem } from "@/feature/tasks/components/TaskItem";
import { TaskDialog } from "@/feature/tasks/components/TaskDialog";
import { Task } from "@/feature/tasks/types/task";
import { CreateTaskRequest } from "@/feature/tasks/services/taskService";
import toast from "react-hot-toast";

const TASK_STATUSES = [
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' }
];

const PRIORITY_LEVELS = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' }
];

export default function TasksPage() {
  const { status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch,
  } = useTasks({
    search: searchTerm,
    status: selectedStatus,
    priority: selectedPriority,
  });

  const handleOpenDialog = (task: Task | null = null) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CreateTaskRequest) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id, data);
        toast.success("Task updated");
      } else {
        await createTask(data);
        toast.success("Task created");
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log(err);
        toast.error(err.message);
      } else {
        toast.error("Failed to save task");
      }
    }
  };

  const handleToggleStatus = async (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await updateTask(taskId, { status: nextStatus });
    } catch (err) {
      if (err instanceof Error) {
        console.log(err);
        toast.error(err.message);
      } else {

        toast.error("Failed to update status");
      }
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
    } catch (err) {
      if (err instanceof Error) {
        console.log(err);
        toast.error(err.message);
      } else {

        toast.error("Failed to delete task");
      }
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">Please log in to manage your tasks.</p>
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
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  const getCount = (statusKey: string) => tasks.filter(t => t.status === statusKey).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your activities and stay productive.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>

      <TaskStats
        total={tasks.length}
        pending={getCount('pending')}
        inProgress={getCount('in_progress')}
        completed={getCount('completed')}
      />

      <TaskFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        statuses={TASK_STATUSES}
        priorities={PRIORITY_LEVELS}
      />

      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onEdit={handleOpenDialog}
          />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-20 bg-card border rounded-2xl border-dashed">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium">All caught up!</h3>
            <p className="text-muted-foreground">No tasks found matching your filters.</p>
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

