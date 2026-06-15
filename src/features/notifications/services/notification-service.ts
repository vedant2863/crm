/**
 * features/notifications/services/notification-service.ts
 *
 * Pure DB layer for notifications.
 * Handles fetching, creating, marking as read, and scanning for tomorrow's due tasks.
 */
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/notification";
import Task from "@/models/task";

export interface CreateNotificationPayload {
  title: string;
  message: string;
  type: "lead" | "task" | "deal" | "general";
  referenceId?: string;
  referenceType?: "contact" | "task" | "deal";
}

/** Create a notification */
export async function createNotification(
  userId: string,
  data: CreateNotificationPayload
) {
  await dbConnect();
  return await Notification.create({
    userId,
    title: data.title,
    message: data.message,
    type: data.type,
    referenceId: data.referenceId || null,
    referenceType: data.referenceType || null,
    read: false,
  });
}

/** Scan for tasks due tomorrow and auto-generate notifications if missing */
async function scanAndGenerateTaskNotifications(userId: string) {
  try {
    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date();
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    endOfTomorrow.setHours(23, 59, 59, 999);

    // Find pending/in_progress tasks due tomorrow for this user
    const tasksDueTomorrow = await Task.find({
      userId,
      status: { $in: ["pending", "in_progress"] },
      dueDate: { $gte: startOfTomorrow, $lte: endOfTomorrow },
    });

    for (const task of tasksDueTomorrow) {
      // Check if we already created a notification for this task
      const exists = await Notification.findOne({
        userId,
        type: "task",
        referenceId: task._id,
      });

      if (!exists) {
        await Notification.create({
          userId,
          title: "Task due tomorrow",
          message: `Task "${task.title}" is due tomorrow.`,
          type: "task",
          referenceId: task._id,
          referenceType: "task",
          read: false,
        });
      }
    }
  } catch (error) {
    console.error("Error scanning due tomorrow tasks for notifications:", error);
  }
}

/** Get recent notifications for a user, scanning tasks first */
export async function getNotifications(userId: string, limit = 50) {
  await dbConnect();

  // Run the dynamic scan to ensure notifications are up to date
  await scanAndGenerateTaskNotifications(userId);

  return await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

/** Mark a single notification as read */
export async function markAsRead(id: string, userId: string) {
  await dbConnect();
  const updated = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { read: true },
    { new: true }
  );
  if (!updated) throw new Error("NOT_FOUND");
  return updated;
}

/** Mark all notifications as read for a user */
export async function markAllAsRead(userId: string) {
  await dbConnect();
  await Notification.updateMany({ userId, read: false }, { read: true });
  return { success: true };
}
