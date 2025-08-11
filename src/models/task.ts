import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assignedTo?: mongoose.Types.ObjectId;
  contactId?: mongoose.Types.ObjectId;
  dealId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    contactId: { type: Schema.Types.ObjectId, ref: "Contact" },
    dealId: { type: Schema.Types.ObjectId, ref: "Deal" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, dueDate: 1 });
taskSchema.index({ title: "text", description: "text" });

const Task = mongoose.models.Task || mongoose.model<ITask>("Task", taskSchema);

export default Task;
