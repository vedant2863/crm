/**
 * features/enterprise/services/enterprise-service.ts
 *
 * Backend services for the Enterprise Suite.
 * Includes Audit Logging, Activity Feeds, Comments, and Resend Email Integration.
 */
import dbConnect from "@/lib/dbConnect";
import AuditLog from "@/models/auditLog";
import Activity from "@/models/activity";
import Comment from "@/models/comment";
import User from "@/models/user";
import mongoose from "mongoose";
import { sendEmail } from "@/lib/email/resend";

/** Fetch a user's company/organization name */
export async function getUserOrg(userId: string): Promise<string> {
  await dbConnect();
  const user = await User.findById(userId);
  return user?.company || "SoloTenant";
}

/** Fetch a user's profile detail (e.g. name, role, company) */
export async function getUserInfo(userId: string) {
  await dbConnect();
  const user = await User.findById(userId).select("name role company");
  if (!user) throw new Error("USER_NOT_FOUND");
  return user;
}

/** Write to the security audit log */
export async function logAudit(
  userId: string,
  userName: string,
  action: string,
  details: string,
  ipAddress?: string
) {
  await dbConnect();
  return await AuditLog.create({
    userId,
    userName,
    action,
    details,
    ipAddress: ipAddress || "127.0.0.1",
  });
}

/** Write to the collaborative activity feed */
export async function logActivity(
  organization: string,
  userId: string,
  userName: string,
  action: string,
  entityType: "contact" | "deal" | "task",
  entityId: string
) {
  await dbConnect();
  return await Activity.create({
    organization,
    userId,
    userName,
    action,
    entityType,
    entityId: new mongoose.Types.ObjectId(entityId),
  });
}

/** Deliver email notification — via Resend if key configured, otherwise log to console */
export async function sendEmailNotification(
  userId: string,
  toEmail: string,
  subject: string,
  body: string
) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user || !user.notifications?.emailNotifications) {
    console.log(`[Email Bypassed] Notifications disabled for user: ${toEmail}`);
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || "CRM OS <onboarding@resend.dev>";

  if (apiKey) {
    // ── Live dispatch via Resend transport ──────────────────────────────────
    const htmlBody = `<div style="font-family:sans-serif;padding:20px;border-radius:12px;border:1px solid #eaeaea;max-width:600px">
      <h2 style="color:#6366f1;margin-top:0">CRM OS Notification</h2>
      <p style="color:#333;line-height:1.6;font-size:15px">${body.replace(/\n/g, "<br>")}</p>
      <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0"/>
      <p style="font-size:11px;color:#888;margin-bottom:0">This is an automated message from your CRM OS workspace.</p>
    </div>`;

    const res = await sendEmail({ from: fromAddress, to: toEmail, subject, html: htmlBody, text: body });

    if (res.success) {
      console.log(`✅ [Resend] Email dispatched to ${toEmail} — subject: "${subject}"`);
    } else {
      console.error(`❌ [Resend] Failed to send to ${toEmail}:`, res.error);
    }
  } else {
    // ── Dev fallback: log to console ────────────────────────────────────────
    console.log(`
============================================================
📬 SMTP EMAIL (no RESEND_API_KEY — add one to .env to send real emails)
To:      ${toEmail}
Subject: ${subject}
------------------------------------------------------------
${body}
============================================================
`);
  }
}

/** Create a comment on an entity */
export async function createComment(
  userId: string,
  userName: string,
  content: string,
  entityType: "contact" | "deal" | "task",
  entityId: string
) {
  await dbConnect();
  return await Comment.create({
    userId,
    userName,
    content,
    entityType,
    entityId: new mongoose.Types.ObjectId(entityId),
  });
}

/** Get comments for a specific entity */
export async function getComments(entityId: string) {
  await dbConnect();
  return await Comment.find({
    entityId: new mongoose.Types.ObjectId(entityId),
  })
    .sort({ createdAt: 1 })
    .lean();
}

/** Fetch administrative audit logs (Admin only) */
export async function getAuditLogs(userId: string) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user || user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return await AuditLog.find({}).sort({ createdAt: -1 }).limit(100).lean();
}
