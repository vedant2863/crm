/**
 * features/enterprise/services/business-logic.ts
 *
 * Isolated Business Logic / Domain Hook layer.
 * Contains business rules, notification triggers, activity logging, and audit logs.
 * Separated completely from database query operations.
 *
 * OPTIMIZATION: All hooks now accept a pre-fetched user object instead of
 * re-fetching from DB, eliminating ~9000 redundant queries at 1000 concurrent users.
 * Non-critical side effects (logging) run in parallel via Promise.all.
 */
import {
  logActivity,
  logAudit,
  sendEmailNotification,
} from "./enterprise-service";
import { createNotification } from "@/features/notifications/services/notification-service";

/** Lean user shape passed from services (avoids full Mongoose document overhead) */
interface UserContext {
  _id?: { toString(): string };
  name: string;
  email: string;
  company?: string;
  role?: string;
  notifications?: {
    emailNotifications?: boolean;
    contactActivities?: boolean;
    [key: string]: boolean | undefined;
  };
}

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

export async function afterContactCreated(user: UserContext, userId: string, contact: ContactEventDoc) {
  const userName = user.name;
  const company = user.company || "SoloTenant";

  // Fire logging side effects in parallel
  await Promise.all([
    logActivity(company, userId, userName, `created contact ${contact.name}`, "contact", contact._id.toString()),
    logAudit(userId, userName, "CREATE_CONTACT", `Created contact ${contact.name} (${contact.email})`),
  ]);

  // Trigger Lead Notifications
  if (contact.status === "prospect" || contact.status === "lead") {
    await createNotification(userId, {
      title: "New lead assigned",
      message: `Lead "${contact.name}" has been assigned to you.`,
      type: "lead",
      referenceId: contact._id.toString(),
      referenceType: "contact",
    });

    // Send email notification (respects user's settings)
    await sendEmailNotification(
      userId,
      user.email,
      `🚨 New Lead Assigned: ${contact.name}`,
      `Hi ${userName},\n\nA new lead has been assigned to your organization:\nName: ${contact.name}\nCompany: ${contact.company || "N/A"}\nEmail: ${contact.email}\n\nCheck your dashboard for details.`
    );
  }
}

export async function afterContactUpdated(
  user: UserContext,
  userId: string,
  oldContact: ContactEventDoc,
  newContact: ContactEventDoc
) {
  const userName = user.name;
  const company = user.company || "SoloTenant";

  // Fire logging side effects in parallel
  await Promise.all([
    logActivity(company, userId, userName, `updated contact ${newContact.name}`, "contact", newContact._id.toString()),
    logAudit(userId, userName, "UPDATE_CONTACT", `Updated contact ${newContact.name} (${newContact.email})`),
  ]);

  // Trigger Lead Notifications if status changed to Prospect/Lead
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
      `Hi ${userName},\n\nA contact has been updated to Lead status in your organization:\nName: ${newContact.name}\nCompany: ${newContact.company || "N/A"}\n\nCheck your dashboard for details.`
    );
  }
}

export async function afterContactDeleted(user: UserContext, userId: string, contact: ContactEventDoc) {
  const userName = user.name;
  const company = user.company || "SoloTenant";

  await Promise.all([
    logActivity(company, userId, userName, `deleted contact ${contact.name}`, "contact", contact._id.toString()),
    logAudit(userId, userName, "DELETE_CONTACT", `Deleted contact ${contact.name} (${contact.email})`),
  ]);
}

/* =================================================================
   DEAL BUSINESS HOOKS
   ================================================================= */

export async function afterDealCreated(user: UserContext, userId: string, deal: DealEventDoc) {
  const userName = user.name;
  const company = user.company || "SoloTenant";

  await Promise.all([
    logActivity(company, userId, userName, `created deal ${deal.title}`, "deal", deal._id.toString()),
    logAudit(userId, userName, "CREATE_DEAL", `Created deal ${deal.title} valued at $${deal.value}`),
  ]);

  // Trigger Notification on Win
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
      `Hi ${userName},\n\nCongratulations! A new deal has been marked as WON:\nTitle: ${deal.title}\nValue: $${deal.value.toLocaleString()}\n\nKeep up the great work!`
    );
  }
}

export async function afterDealUpdated(
  user: UserContext,
  userId: string,
  oldDeal: DealEventDoc,
  newDeal: DealEventDoc
) {
  const userName = user.name;
  const company = user.company || "SoloTenant";

  await Promise.all([
    logActivity(company, userId, userName, `updated deal ${newDeal.title} (Stage: ${newDeal.stage})`, "deal", newDeal._id.toString()),
    logAudit(userId, userName, "UPDATE_DEAL", `Updated deal ${newDeal.title} (value: $${newDeal.value}, stage: ${newDeal.stage})`),
  ]);

  // Trigger Deal Won transition alert
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
      `Hi ${userName},\n\nCongratulations! Deal "${newDeal.title}" valued at $${newDeal.value.toLocaleString()} has transitioned to WON!\n\nCheck your pipeline details for more info.`
    );
  }
}

export async function afterDealDeleted(user: UserContext, userId: string, deal: DealEventDoc) {
  const userName = user.name;
  const company = user.company || "SoloTenant";

  await Promise.all([
    logActivity(company, userId, userName, `deleted deal ${deal.title}`, "deal", deal._id.toString()),
    logAudit(userId, userName, "DELETE_DEAL", `Deleted deal ${deal.title} valued at $${deal.value}`),
  ]);
}

/* =================================================================
   TASK BUSINESS HOOKS
   ================================================================= */

export async function afterTaskCreated(user: UserContext, userId: string, task: TaskEventDoc) {
  const userName = user.name;
  const company = user.company || "SoloTenant";

  await Promise.all([
    logActivity(company, userId, userName, `created task ${task.title}`, "task", task._id.toString()),
    logAudit(userId, userName, "CREATE_TASK", `Created task ${task.title} (due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "none"})`),
  ]);
}

export async function afterTaskUpdated(
  user: UserContext,
  userId: string,
  _oldTask: TaskEventDoc,
  newTask: TaskEventDoc
) {
  const userName = user.name;
  const company = user.company || "SoloTenant";

  await Promise.all([
    logActivity(company, userId, userName, `updated task ${newTask.title} (Status: ${newTask.status})`, "task", newTask._id.toString()),
    logAudit(userId, userName, "UPDATE_TASK", `Updated task ${newTask.title} (status: ${newTask.status}, priority: ${newTask.priority})`),
  ]);
}

export async function afterTaskDeleted(user: UserContext, userId: string, task: TaskEventDoc) {
  const userName = user.name;
  const company = user.company || "SoloTenant";

  await Promise.all([
    logActivity(company, userId, userName, `deleted task ${task.title}`, "task", task._id.toString()),
    logAudit(userId, userName, "DELETE_TASK", `Deleted task ${task.title}`),
  ]);
}
