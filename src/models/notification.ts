import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "lead" | "task" | "deal" | "general";
  read: boolean;
  referenceId?: mongoose.Types.ObjectId;
  referenceType?: "contact" | "task" | "deal";
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["lead", "task", "deal", "general"],
      default: "general",
    },
    read: { type: Boolean, default: false },
    referenceId: { type: Schema.Types.ObjectId },
    referenceType: { type: String, enum: ["contact", "task", "deal"] },
  },
  {
    timestamps: true,
  }
);

// Optimize sorting and lookup index
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
