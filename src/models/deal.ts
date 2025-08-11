import mongoose, { Schema, Document } from "mongoose";

export interface IDeal extends Document {
  title: string;
  description?: string;
  value: number;
  stage: "new" | "contacted" | "negotiation" | "won" | "lost";
  contactId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  expectedCloseDate?: Date;
  priority: "low" | "medium" | "high";
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dealSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    value: { type: Number, required: true, min: 0 },
    stage: {
      type: String,
      enum: ["new", "contacted", "negotiation", "won", "lost"],
      default: "new",
    },
    contactId: { type: Schema.Types.ObjectId, ref: "Contact" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expectedCloseDate: { type: Date },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    tags: [{ type: String }],
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
dealSchema.index({ userId: 1, stage: 1 });
dealSchema.index({ title: "text", description: "text" });

const Deal = mongoose.models.Deal || mongoose.model<IDeal>("Deal", dealSchema);

export default Deal;
