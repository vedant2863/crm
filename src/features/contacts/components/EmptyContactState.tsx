import { Users } from "lucide-react";
import { EmptyState } from "@/components/common";

export default function EmptyContactState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No contacts found"
      description="Try adjusting your search or filters to find what you are looking for."
      action={onAdd ? { label: "Add Contact", onClick: onAdd } : undefined}
    />
  );
}
