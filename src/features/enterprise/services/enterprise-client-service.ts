/**
 * features/enterprise/services/enterprise-client-service.ts
 *
 * Client-side HTTP wrappers for Comments and Audit Logs.
 */

export interface ClientComment {
  _id: string;
  userId: string;
  userName: string;
  content: string;
  entityType: "contact" | "deal" | "task";
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientAuditLog {
  _id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

/** Fetch all comments for a specific entity */
export async function fetchComments(
  entityId: string
): Promise<ClientComment[]> {
  const res = await fetch(`/api/comments?entityId=${entityId}`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  const data = await res.json();
  return data.comments || [];
}

/** Add a new comment on an entity */
export async function addComment(
  entityId: string,
  entityType: "contact" | "deal" | "task",
  content: string
): Promise<ClientComment> {
  const res = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entityId, entityType, content }),
  });
  if (!res.ok) throw new Error("Failed to create comment");
  const data = await res.json();
  return data.comment;
}

/** Fetch administrative audit logs (Admin only) */
export async function fetchAuditLogs(): Promise<ClientAuditLog[]> {
  const res = await fetch("/api/admin/audit-logs");
  if (!res.ok) {
    if (res.status === 403) throw new Error("UNAUTHORIZED");
    throw new Error("Failed to fetch audit logs");
  }
  const data = await res.json();
  return data.logs || [];
}
