import { memo } from "react";
import { cn } from "@/lib/utils";

interface ContactStatusBadgeProps {
  status: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    case "prospect":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20";
    case "inactive":
      return "bg-muted text-muted-foreground border border-border/50";
    default:
      return "bg-muted text-muted-foreground border border-border/50";
  }
};

const ContactStatusBadge = memo(function ContactStatusBadge({
  status,
}: ContactStatusBadgeProps) {
  const safeStatus = status || "unknown";
  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
        getStatusColor(safeStatus)
      )}
    >
      {safeStatus}
    </span>
  );
});

export default ContactStatusBadge;
