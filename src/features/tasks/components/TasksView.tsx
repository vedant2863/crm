"use client";

import { useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "../hooks/useTasks";
import type { Task } from "../types/task";
import { TaskStats } from "./TaskStats";
import { TaskFilters } from "./TaskFilters";
import { TaskItem } from "./TaskItem";
import { TaskDialog } from "./TaskDialog";
import { TaskBoard } from "./TaskBoard";
import type { CreateTaskRequest } from "../services/task-client-service";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth/auth-client";
import {
  PageHeader,
  ViewToggle,
  EmptyState,
  LoadingSkeleton,
  AuthRequired,
  ErrorState,
  ConfirmDialog,
} from "@/components/common";

const TASK_STATUSES: {
  key: "pending" | "in_progress" | "completed" | "cancelled";
  label: string;
}[] = [
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const PRIORITY_LEVELS = [
  { key: "low", label: "Low" },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High" },
];

export function TasksView() {
  const { status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const { tasks, loading, error, createTask, updateTask, deleteTask, refetch } =
    useTasks({
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
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await updateTask(taskId, { status: nextStatus });
    } catch (err) {
      if (err instanceof Error) {
        console.log(err);
        toast.error(err.message);
      } else {
        toast.error("Failed to update task");
      }
    }
  };

  const handleMoveStatus = async (
    taskId: string,
    newStatus: "pending" | "in_progress" | "completed" | "cancelled"
  ) => {
    try {
      await updateTask(taskId, { status: newStatus });
      toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err);
        toast.error(err.message);
      } else {
        toast.error("Failed to move task");
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
    return <LoadingSkeleton type="page" />;
  }

  if (status === "unauthenticated") {
    return <AuthRequired description="Please log in to manage your tasks." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Tasks"
        message={error}
        onRetry={refetch}
      />
    );
  }

  const getCount = (statusKey: string) =>
    tasks.filter((t) => t.status === statusKey).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Tasks"
        description="Manage your activities and stay productive."
        actions={
          <div className="flex items-center gap-3">
            <ViewToggle<"board" | "list">
              mode={viewMode}
              onChange={setViewMode}
              options={[
                { value: "board", label: "Board" },
                { value: "list", label: "List" },
              ]}
            />
            <Button
              onClick={() => handleOpenDialog()}
              className="shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Task
            </Button>
          </div>
        }
      />

      <TaskStats
        total={tasks.length}
        pending={getCount("pending")}
        inProgress={getCount("in_progress")}
        completed={getCount("completed")}
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

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All caught up!"
          description="No tasks found matching your filters. Create a new task to stay organized."
          action={{
            label: "Add Task",
            onClick: () => handleOpenDialog(),
            icon: Plus,
          }}
        />
      ) : viewMode === "board" ? (
        <TaskBoard
          statuses={TASK_STATUSES}
          tasks={tasks}
          onToggleStatus={handleToggleStatus}
          onDelete={(id) => setDeleteTaskId(id)}
          onEdit={handleOpenDialog}
          onMoveStatus={handleMoveStatus}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggleStatus={handleToggleStatus}
              onDelete={(id) => setDeleteTaskId(id)}
              onEdit={handleOpenDialog}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTaskId}
        onOpenChange={(open) => !open && setDeleteTaskId(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        onConfirm={async () => {
          if (deleteTaskId) {
            await handleDelete(deleteTaskId);
            setDeleteTaskId(null);
          }
        }}
      />

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingTask}
      />
    </div>
  );
}

export default TasksView;
