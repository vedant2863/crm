import mongoose, { Schema, Document } from "mongoose";

export interface IDeal extends Document {
  _id: string;
  title: string;
  description?: string;
  value: number;
  stage:
    | "new"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "won"
    | "lost"
    | "contacted";
  probability?: number;
  expectedCloseDate?: Date;
  contactName?: string;
  company?: string;
  assignedTo?: string;
  contactId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  priority: "low" | "medium" | "high";
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: string;
}

const dealSchema = new Schema<IDeal>(
  {
    title: { type: String, required: true },
    description: { type: String },
    value: { type: Number, required: true, min: 0 },
    stage: {
      type: String,
      enum: [
        "new",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
        "contacted",
      ],
      default: "new",
    },
    probability: { type: Number, min: 0, max: 100 },
    expectedCloseDate: { type: Date },
    contactName: { type: String },
    company: { type: String },
    assignedTo: { type: String },
    contactId: { type: Schema.Types.ObjectId, ref: "Contact" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    tags: [{ type: String }],
    notes: { type: String },
    lastActivity: { type: String },
  },
  {
    timestamps: true, // ✅ auto adds createdAt & updatedAt
  }
);

// Indexes for faster queries
dealSchema.index({ userId: 1, stage: 1 });
dealSchema.index({ title: "text", description: "text" });

const Deal = mongoose.models.Deal || mongoose.model<IDeal>("Deal", dealSchema);

export default Deal;
