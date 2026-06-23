"use client";

import { useState } from "react";
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";

interface Status {
  key: "pending" | "in_progress" | "completed" | "cancelled";
  label: string;
}

interface TaskBoardProps {
  statuses: Status[];
  tasks: Task[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onMoveStatus: (taskId: string, newStatus: "pending" | "in_progress" | "completed" | "cancelled") => void;
}

export function TaskBoard({
  statuses,
  tasks,
  onToggleStatus,
  onDelete,
  onEdit,
  onMoveStatus,
}: TaskBoardProps) {
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch min-h-[600px] overflow-x-auto pb-4">
      {statuses.map((status) => {
        const statusTasks = tasks.filter((t) => t.status === status.key);
        const isDraggedOver = dragOverStatus === status.key;

        return (
          <div key={status.key} className="flex flex-col h-full min-w-[260px] flex-1">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  {status.label}
                </h3>
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] font-bold text-foreground">
                  {statusTasks.length}
                </span>
              </div>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setDragOverStatus(status.key)}
              onDragLeave={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX;
                const y = e.clientY;
                if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
                  setDragOverStatus(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverStatus(null);
                const taskId = e.dataTransfer.getData("text/plain");
                if (taskId) {
                  onMoveStatus(taskId, status.key);
                }
              }}
              className={`flex-1 space-y-3 p-3 rounded-2xl border border-dashed transition-all duration-300 min-h-[500px] ${
                isDraggedOver
                  ? "bg-primary/10 border-primary/40 scale-[1.01]"
                  : "bg-muted/30 border-muted-foreground/20"
              }`}
            >
              {statusTasks.map((task) => (
                <div key={task._id} className="relative group">
                  <TaskItem
                    task={task}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                </div>
              ))}

              {statusTasks.length === 0 && (
                <div className="flex items-center justify-center h-40 text-muted-foreground/30 text-xs font-bold uppercase tracking-wider italic">
                  Drop Here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
