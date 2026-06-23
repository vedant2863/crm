import mongoose, { Schema } from "mongoose";

const aiCallLogSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: 86400 } }, // TTL Index: deletes records older than 24 hours
    key: { type: String, index: true }, // Cache key for retrieving previous results
    result: { type: Schema.Types.Mixed }, // Cached AI result payload
  }
);

const AiCallLog = mongoose.models.AiCallLog || mongoose.model("AiCallLog", aiCallLogSchema);

export default AiCallLog;
