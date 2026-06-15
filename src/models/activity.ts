import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  organization: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  action: string; // e.g. "created contact Sarah Wilson", "advanced deal TechCorp to Qualified"
  entityType: "contact" | "deal" | "task";
  entityId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    organization: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, enum: ["contact", "deal", "task"], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup by organization timeline
activitySchema.index({ organization: 1, createdAt: -1 });

const Activity =
  mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", activitySchema);

export default Activity;
