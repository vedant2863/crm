export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assignedTo?: string;
  contactId?: {
    _id: string;
    name: string;
    company?: string;
  };
  dealId?: {
    _id: string;
    title: string;
  };
  userId: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}
