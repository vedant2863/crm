/**
 * features/tasks/services/task-service.ts
 *
 * Pure DB layer for tasks.
 * Separated from business logic and respects the collaborative sharing toggle.
 */
import dbConnect from "@/lib/dbConnect";
import Task from "@/models/task";
import User from "@/models/user";
import { FilterQuery } from "mongoose";
import {
  afterTaskCreated,
  afterTaskUpdated,
  afterTaskDeleted,
} from "@/features/enterprise/services/business-logic";

export interface TaskFilters {
  userId: string;
  search?: string | null;
  status?: string | null;
  priority?: string | null;
  page?: number;
  limit?: number;
}

export interface TaskPayload {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  contactId?: string | null;
  dealId?: string | null;
  tags?: string[];
}

/** Get list of user IDs belonging to the same organization/company (respects privacy toggle) */
async function getOrganizationUserIds(userId: string): Promise<string[]> {
  const user = await User.findById(userId);
  if (!user) return [userId];

  // If Collaborative Team Sharing toggle is OFF, tasks are kept private
  if (!user.notifications?.contactActivities) {
    return [userId];
  }

  if (!user.company) return [userId];
  const usersInCompany = await User.find({ company: user.company }).select("_id");
  return usersInCompany.map((u) => u._id.toString());
}

/** List tasks for an organization/user with optional filters */
export async function getTasks({ userId, search, status, priority, page = 1, limit = 100 }: TaskFilters) {
  await dbConnect();
  const orgUserIds = await getOrganizationUserIds(userId);

  const skip = (page - 1) * limit;
  const query: FilterQuery<unknown> = { userId: { $in: orgUserIds } };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (status && status !== "all") query.status = status;
  if (priority && priority !== "all") query.priority = priority;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate("contactId", "name company")
      .populate("dealId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(query),
  ]);

  const formatted = (tasks as unknown as { _id: { toString(): string } }[]).map((t) => ({
    ...t,
    _id: t._id.toString(),
  }));

  return { tasks: formatted, total, page, limit, pages: Math.ceil(total / limit) };
}

/** Get a single task by ID (scoped to organization/user) */
export async function getTaskById(id: string, userId: string) {
  await dbConnect();
  const orgUserIds = await getOrganizationUserIds(userId);
  const task = await Task.findOne({ _id: id, userId: { $in: orgUserIds } })
    .populate("contactId", "name company")
    .populate("dealId", "title");
  if (!task) throw new Error("NOT_FOUND");
  return task;
}

/** Create a new task */
export async function createTask(userId: string, data: TaskPayload) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const task = new Task({
    ...data,
    priority: data.priority || "medium",
    status: data.status || "pending",
    assignedTo: data.assignedTo || userId,
    contactId: data.contactId || null,
    dealId: data.dealId || null,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    tags: data.tags || [],
    userId,
  });

  await task.save();

  // Delegate side-effect business logic hooks
  await afterTaskCreated(userId, task);

  const populated = await Task.findById(task._id)
    .populate("contactId", "name company")
    .populate("dealId", "title");

  return populated;
}

/** Update an existing task (scoped to organization/user) */
export async function updateTask(id: string, userId: string, data: Partial<TaskPayload>) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const orgUserIds = await getOrganizationUserIds(userId);
  const existingTask = await Task.findOne({ _id: id, userId: { $in: orgUserIds } });
  if (!existingTask) throw new Error("NOT_FOUND");

  const oldTask = { ...existingTask.toObject() };

  const updated = await Task.findOneAndUpdate(
    { _id: id },
    {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      contactId: data.contactId || null,
      dealId: data.dealId || null,
      tags: data.tags || [],
    },
    { new: true }
  )
    .populate("contactId", "name company")
    .populate("dealId", "title");

  if (!updated) throw new Error("NOT_FOUND");

  // Delegate side-effect business logic hooks
  await afterTaskUpdated(userId, oldTask, updated);

  return updated;
}

/** Delete a task (scoped to organization/user with RBAC) */
export async function deleteTask(id: string, userId: string) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const orgUserIds = await getOrganizationUserIds(userId);
  const task = await Task.findOne({ _id: id, userId: { $in: orgUserIds } });
  if (!task) throw new Error("NOT_FOUND");

  // RBAC gates: Admin or Creator
  const isCreator = task.userId.toString() === userId;
  const isAdmin = user.role === "admin";
  if (!isCreator && !isAdmin) {
    throw new Error("UNAUTHORIZED");
  }

  await Task.findByIdAndDelete(id);

  // Delegate side-effect business logic hooks
  await afterTaskDeleted(userId, task);

  return { id };
}
