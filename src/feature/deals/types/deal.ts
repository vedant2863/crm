export interface Deal {
  _id: string; 
  title: string;
  description?: string; 
  value: number; 
  stage: "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost" | "contacted"; 
  probability: number;
  expectedCloseDate?: string;
  contactName: string; 
  company?: string;
  assignedTo?: string;
  contactId?: string;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  lastActivity?: string; 
  notes?: string; 
}
