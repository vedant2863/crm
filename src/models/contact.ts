import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  tags?: string[];
  notes?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number },
    company: { type: String },
    position: { type: String },
    tags: [{ type: String }],
    notes: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
contactSchema.index({ userId: 1, email: 1 });
contactSchema.index({ name: "text", company: "text", email: "text" });

const Contact = mongoose.models.Contact || mongoose.model<IContact>("Contact", contactSchema);

export default Contact;
