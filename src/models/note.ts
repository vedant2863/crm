import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  title?: string;
  content: string;
  pinned: boolean;
  dealId?: mongoose.Types.ObjectId; // Linked to lead/deal
  userId: mongoose.Types.ObjectId;  // Scoped to user (multi-tenant)
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String },
    content: { type: String, required: true },
    pinned: { type: Boolean, default: false },
    dealId: { type: Schema.Types.ObjectId, ref: "Deal" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ userId: 1, pinned: -1 });
noteSchema.index({ dealId: 1 });

const Note = mongoose.models.Note || mongoose.model<INote>("Note", noteSchema);

export default Note;
