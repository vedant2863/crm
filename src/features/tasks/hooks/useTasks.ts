"use client";

import { useState, useEffect, useCallback } from "react";

import {
  taskService,
  TasksResponse,
  CreateTaskRequest,
} from "@/features/tasks/services/task-client-service";
import { Task } from "@/features/tasks/types/task";
import { useSession } from "@/lib/auth/auth-client";
import { getSocketClient } from "@/lib/socket/socket-client";
import toast from "react-hot-toast";

export interface UseTasksOptions {
  search?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export function useTasks(options: UseTasksOptions = {}) {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchTasks = useCallback(async () => {
    if (status !== "authenticated") return;

    try {
      setLoading(true);
      setError(null);

      const response: TasksResponse = await taskService.getTasks({
        search: options.search,
        status: options.status,
        priority: options.priority,
        page: options.page || 1,
        limit: options.limit || 100,
      });

      setTasks(response.tasks);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch tasks";
      setError(errorMessage);
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [
    status,
    options.search,
    options.status,
    options.priority,
    options.page,
    options.limit,
  ]);

  const createTask = useCallback(async (taskData: CreateTaskRequest) => {
    try {
      const response = await taskService.createTask(taskData);
      setTasks((prev) => [response.task, ...prev]);
      return response.task;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create task";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateTask = useCallback(
    async (id: string, taskData: Partial<CreateTaskRequest>) => {
      try {
        const response = await taskService.updateTask(id, taskData);
        setTasks((prev) =>
          prev.map((task) => (task._id === id ? response.task : task)),
        );
        return response.task;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update task";
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete task";
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Real-time Socket.IO synchronization for tasks
  useEffect(() => {
    if (typeof window === "undefined" || status !== "authenticated") return;

    const socket = getSocketClient();

    const joinRoom = () => {
      if (session?.user?.id) {
        socket.emit("join:pipeline", {
          userId: session.user.id,
          company: (session.user as { company?: string })?.company,
        });
      }
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", joinRoom);

    const handleTaskCreated = (payload: {
      task: Task;
      userId: string;
      userName: string;
    }) => {
      setTasks((prev) => [
        payload.task,
        ...prev.filter((t) => t._id !== payload.task._id),
      ]);
      if (payload.userId !== session?.user?.id && payload.userName) {
        toast(`📋 ${payload.userName} created task: "${payload.task.title}"`, {
          icon: "⚡",
        });
      }
    };

    const handleTaskUpdated = (payload: {
      task: Task;
      userId: string;
      userName: string;
    }) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === payload.task._id ? payload.task : t)),
      );
      if (payload.userId !== session?.user?.id && payload.userName) {
        toast(`🔄 ${payload.userName} updated task: "${payload.task.title}"`, {
          icon: "⚡",
        });
      }
    };

    const handleTaskDeleted = (payload: {
      taskId: string;
      userId: string;
      userName: string;
    }) => {
      setTasks((prev) => prev.filter((t) => t._id !== payload.taskId));
      if (payload.userId !== session?.user?.id && payload.userName) {
        toast(`🗑️ ${payload.userName} deleted a task`, { icon: "⚡" });
      }
    };

    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);
    socket.on("task:deleted", handleTaskDeleted);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleTaskUpdated);
      socket.off("task:deleted", handleTaskDeleted);
    };
  }, [session, status]);

  const refetch = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    pagination,
    createTask,
    updateTask,
    deleteTask,
    refetch,
  };
}
