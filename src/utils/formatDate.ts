/**
 * utils/formatDate.ts
 *
 * Global helpers for date formatting.
 */

/** "Jun 15, 2026" */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** "Jun 15" */
export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** "3 hours ago" / "2 days ago" */
export function formatTimeAgo(date: Date | string): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/** ISO string → "YYYY-MM-DD" for input[type=date] */
export function toInputDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}
