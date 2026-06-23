/**
 * features/enterprise/services/enterprise-service.ts
 *
 * Backend services for the Enterprise Suite.
 * Includes Audit Logging, Activity Feeds, Comments, and Mock Email Integration.
 */
import dbConnect from "@/lib/dbConnect";
import AuditLog from "@/models/auditLog";
import Activity from "@/models/activity";
import Comment from "@/models/comment";
import User from "@/models/user";
import mongoose from "mongoose";

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

/** Simulate and deliver SMTP Email notifications */
export async function sendEmailNotification(
  userId: string,
  toEmail: string,
  subject: string,
  body: string
) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user || !user.notifications?.emailNotifications) {
    console.log(`[SMTP EMAIL BYPASSED] Notifications disabled for user: ${toEmail}`);
    return;
  }

  // Output mock logging console layout
  console.log(`
============================================================
📬 MOCK SMTP EMAIL TRANSMISSION
Time: ${new Date().toISOString()}
To: ${toEmail}
Subject: ${subject}
------------------------------------------------------------
${body}
============================================================
`);

  // Integrate Resend API (free tier, 3k emails/month) if API key is configured
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "CRM OS <onboarding@resend.dev>",
          to: toEmail,
          subject: subject,
          html: `<div style="font-family: sans-serif; padding: 20px; border-radius: 12px; border: 1px solid #eaeaea; max-width: 600px;">
            <h2 style="color: #6366f1; margin-top: 0;">CRM OS Notification</h2>
            <p style="color: #333333; line-height: 1.6; font-size: 15px;">${body.replace(/\n/g, "<br>")}</p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="font-size: 11px; color: #888888; margin-bottom: 0;">This is an automated message sent from your CRM OS workspace.</p>
          </div>`,
        }),
      });

      if (response.ok) {
        console.log(`✨ [Resend Email Sent] Successfully dispatched email notification to ${toEmail}`);
      } else {
        const errorDetails = await response.text();
        console.error(`❌ [Resend Email Error] API rejected the request:`, errorDetails);
      }
    } catch (err) {
      console.error(`❌ [Resend Email Exception] Failed to execute fetch operation:`, err);
    }
  } else {
    console.log(`ℹ️ [Email Service Config] To send real emails for free, add a RESEND_API_KEY to your local .env configuration.`);
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
