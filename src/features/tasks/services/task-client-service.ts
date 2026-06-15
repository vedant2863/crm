import { Task } from "../types/task";

export interface TasksResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  assignedTo?: string;
  contactId?: string;
  dealId?: string;
  tags?: string[];
}

class TaskService {
  private baseUrl = "/api/tasks";

  async getTasks(params?: {
    search?: string;
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<TasksResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status && params.status !== "all") searchParams.append("status", params.status);
    if (params?.priority && params.priority !== "all") searchParams.append("priority", params.priority);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const url = searchParams.toString() 
      ? `${this.baseUrl}?${searchParams.toString()}`
      : this.baseUrl;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    return response.json();
  }

  async getTask(id: string): Promise<{ task: Task }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch task: ${response.statusText}`);
    }

    return response.json();
  }

  async createTask(task: CreateTaskRequest): Promise<{ task: Task }> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to create task: ${response.statusText}`);
    }

    return response.json();
  }

  async updateTask(id: string, task: Partial<CreateTaskRequest>): Promise<{ task: Task }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update task: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to delete task: ${response.statusText}`);
    }

    return response.json();
  }
}

export const taskService = new TaskService();
