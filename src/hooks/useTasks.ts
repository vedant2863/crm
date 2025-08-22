import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { taskService, TasksResponse, CreateTaskRequest } from "@/feature/tasks/services/taskService";
import { Task } from "@/feature/tasks/types/task";

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
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tasks";
      setError(errorMessage);
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [status, options.search, options.status, options.priority, options.page, options.limit]);

  const createTask = useCallback(async (taskData: CreateTaskRequest) => {
    try {
      const response = await taskService.createTask(taskData);
      setTasks(prev => [response.task, ...prev]);
      return response.task;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id: string, taskData: Partial<CreateTaskRequest>) => {
    try {
      const response = await taskService.updateTask(id, taskData);
      setTasks(prev => prev.map(task => 
        task._id === id ? response.task : task
      ));
      return response.task;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task._id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete task";
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
