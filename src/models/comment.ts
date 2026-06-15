import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  content: string;
  entityType: "contact" | "deal" | "task";
  entityId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    entityType: { type: String, enum: ["contact", "deal", "task"], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup by entity
commentSchema.index({ entityId: 1, createdAt: 1 });

const Comment =
  mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
