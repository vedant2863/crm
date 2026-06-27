/**
 * features/enterprise/services/business-logic.ts
 *
 * Isolated Business Logic / Domain Hook layer.
 * Contains business rules, notification triggers, activity logging, and audit logs.
 * Separated completely from database query operations.
 */
import {
  logActivity,
  logAudit,
  sendEmailNotification,
} from "./enterprise-service";
import { createNotification } from "@/features/notifications/services/notification-service";
import User from "@/models/user";

// Event document interfaces to avoid 'any' types in hooks
export interface ContactEventDoc {
  _id: { toString(): string };
  name: string;
  email: string;
  status?: string;
  company?: string;
}

export interface DealEventDoc {
  _id: { toString(): string };
  title: string;
  value: number;
  stage: string;
}

export interface TaskEventDoc {
  _id: { toString(): string };
  title: string;
  dueDate?: Date | null;
  status: string;
  priority: string;
}

/* =================================================================
   CONTACT BUSINESS HOOKS
   ================================================================= */

export async function afterContactCreated(userId: string, contact: ContactEventDoc) {
  const user = await User.findById(userId);
  if (!user) return;

  // 1. Log Activity
  await logActivity(
    user.company || "SoloTenant",
    userId,
    user.name,
    `created contact ${contact.name}`,
    "contact",
    contact._id.toString()
  );

  // 2. Log Audit Log
  await logAudit(
    userId,
    user.name,
    "CREATE_CONTACT",
    `Created contact ${contact.name} (${contact.email})`
  );

  // 3. Trigger Lead Notifications
  if (contact.status === "prospect" || contact.status === "lead") {
    await createNotification(userId, {
      title: "New lead assigned",
      message: `Lead "${contact.name}" has been assigned to you.`,
      type: "lead",
      referenceId: contact._id.toString(),
      referenceType: "contact",
    });

    // Send Mock SMTP Email Notification (respects user's settings)
    await sendEmailNotification(
      userId,
      user.email,
      `🚨 New Lead Assigned: ${contact.name}`,
      `Hi ${user.name},\n\nA new lead has been assigned to your organization:\nName: ${contact.name}\nCompany: ${contact.company || "N/A"}\nEmail: ${contact.email}\n\nCheck your dashboard for details.`
    );
  }
}

export async function afterContactUpdated(
  userId: string,
  oldContact: ContactEventDoc,
  newContact: ContactEventDoc
) {
  const user = await User.findById(userId);
  if (!user) return;

  // 1. Log Activity
  await logActivity(
    user.company || "SoloTenant",
    userId,
    user.name,
    `updated contact ${newContact.name}`,
    "contact",
    newContact._id.toString()
  );

  // 2. Log Audit Log
  await logAudit(
    userId,
    user.name,
    "UPDATE_CONTACT",
    `Updated contact ${newContact.name} (${newContact.email})`
  );

  // 3. Trigger Lead Notifications if status changed to Prospect/Lead
  const wasLead = oldContact.status === "prospect" || oldContact.status === "lead";
  const isNowLead = newContact.status === "prospect" || newContact.status === "lead";

  if (isNowLead && !wasLead) {
    await createNotification(userId, {
      title: "New lead assigned",
      message: `Lead "${newContact.name}" has been assigned to you.`,
      type: "lead",
      referenceId: newContact._id.toString(),
      referenceType: "contact",
    });

    await sendEmailNotification(
      userId,
      user.email,
      `🚨 New Lead Assigned: ${newContact.name}`,
      `Hi ${user.name},\n\nA contact has been updated to Lead status in your organization:\nName: ${newContact.name}\nCompany: ${newContact.company || "N/A"}\n\nCheck your dashboard for details.`
    );
  }
}

export async function afterContactDeleted(userId: string, contact: ContactEventDoc) {
  const user = await User.findById(userId);
  if (!user) return;

  // 1. Log Activity
  await logActivity(
    user.company || "SoloTenant",
    userId,
    user.name,
    `deleted contact ${contact.name}`,
    "contact",
    contact._id.toString()
  );

  // 2. Log Audit Log
  await logAudit(
    userId,
    user.name,
    "DELETE_CONTACT",
    `Deleted contact ${contact.name} (${contact.email})`
  );
}

/* =================================================================
   DEAL BUSINESS HOOKS
   ================================================================= */

export async function afterDealCreated(userId: string, deal: DealEventDoc) {
  const user = await User.findById(userId);
  if (!user) return;

  // 1. Log Activity
  await logActivity(
    user.company || "SoloTenant",
    userId,
    user.name,
    `created deal ${deal.title}`,
    "deal",
    deal._id.toString()
  );

  // 2. Log Audit Log
  await logAudit(
    userId,
    user.name,
    "CREATE_DEAL",
    `Created deal ${deal.title} valued at $${deal.value}`
  );

  // 3. Trigger Notification on Win
  if (deal.stage === "won") {
    await createNotification(userId, {
      title: "Deal moved to Won",
      message: `Deal "${deal.title}" has been moved to Won.`,
      type: "deal",
      referenceId: deal._id.toString(),
      referenceType: "deal",
    });

    await sendEmailNotification(
      userId,
      user.email,
      `🏆 Deal Won! ${deal.title}`,
      `Hi ${user.name},\n\nCongratulations! A new deal has been marked as WON:\nTitle: ${deal.title}\nValue: $${deal.value.toLocaleString()}\n\nKeep up the great work!`
    );
  }
}

export async function afterDealUpdated(
  userId: string,
  oldDeal: DealEventDoc,
  newDeal: DealEventDoc
) {
  const user = await User.findById(userId);
  if (!user) return;

  // 1. Log Activity
  await logActivity(
    user.company || "SoloTenant",
    userId,
    user.name,
    `updated deal ${newDeal.title} (Stage: ${newDeal.stage})`,
    "deal",
    newDeal._id.toString()
  );

  // 2. Log Audit Log
  await logAudit(
    userId,
    user.name,
    "UPDATE_DEAL",
    `Updated deal ${newDeal.title} (value: $${newDeal.value}, stage: ${newDeal.stage})`
  );

  // 3. Trigger Deal Won transition alert
  const wasWon = oldDeal.stage === "won";
  const isNowWon = newDeal.stage === "won";

  if (isNowWon && !wasWon) {
    await createNotification(userId, {
      title: "Deal moved to Won",
      message: `Deal "${newDeal.title}" has been moved to Won.`,
      type: "deal",
      referenceId: newDeal._id.toString(),
      referenceType: "deal",
    });

    await sendEmailNotification(
      userId,
      user.email,
      `🏆 Deal Won! ${newDeal.title}`,
      `Hi ${user.name},\n\nCongratulations! Deal "${newDeal.title}" valued at $${newDeal.value.toLocaleString()} has transitioned to WON!\n\nCheck your pipeline details for more info.`
    );
  }
}

export async function afterDealDeleted(userId: string, deal: DealEventDoc) {
  const user = await User.findById(userId);
  if (!user) return;

  // 1. Log Activity
  await logActivity(
    user.company || "SoloTenant",
    userId,
    user.name,
    `deleted deal ${deal.title}`,
    "deal",
    deal._id.toString()
  );

  // 2. Log Audit Log
  await logAudit(
    userId,
    user.name,
    "DELETE_DEAL",
    `Deleted deal ${deal.title} valued at $${deal.value}`
  );
}

/* =================================================================
   TASK BUSINESS HOOKS
   ================================================================= */

export async function afterTaskCreated(userId: string, task: TaskEventDoc) {
  const user = await User.findById(userId);
  if (!user) return;

  // 1. Log Activity
  await logActivity(
    user.company || "SoloTenant",
    userId,
    user.name,
    `created task ${task.title}`,
    "task",
    task._id.toString()
  );

  // 2. Log Audit Log
  await logAudit(
    userId,
    user.name,
    "CREATE_TASK",
    `Created task ${task.title} (due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "none"})`
  );
}

export async function afterTaskUpdated(
  userId: string,
  _oldTask: TaskEventDoc,
  newTask: TaskEventDoc
) {
  const user = await User.findById(userId);
  if (!user) return;

  // 1. Log Activity
  await logActivity(
    user.company || "SoloTenant",
    userId,
    user.name,
    `updated task ${newTask.title} (Status: ${newTask.status})`,
    "task",
    newTask._id.toString()
  );

  // 2. Log Audit Log
  await logAudit(
    userId,
    user.name,
    "UPDATE_TASK",
    `Updated task ${newTask.title} (status: ${newTask.status}, priority: ${newTask.priority})`
  );
}

export async function afterTaskDeleted(userId: string, task: TaskEventDoc) {
  const user = await User.findById(userId);
  if (!user) return;

  // 1. Log Activity
  await logActivity(
    user.company || "SoloTenant",
    userId,
    user.name,
    `deleted task ${task.title}`,
    "task",
    task._id.toString()
  );

  // 2. Log Audit Log
  await logAudit(
    userId,
    user.name,
    "DELETE_TASK",
    `Deleted task ${task.title}`
  );
}
