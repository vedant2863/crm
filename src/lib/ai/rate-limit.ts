import dbConnect from "@/lib/dbConnect";
import AiCallLog from "@/models/aiCallLog";

/**
 * Gets the most recent cached AI result for the given user and cache key within the last 24 hours.
 */
export async function getPreviousAiCall(userId: string, key: string): Promise<unknown> {
  await dbConnect();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const log = await AiCallLog.findOne({
    userId,
    key,
    createdAt: { $gte: oneDayAgo }
  }).sort({ createdAt: -1 });

  return log ? log.result : null;
}

/**
 * Checks if the user is within their rolling 24-hour limit of 5 AI calls.
 */
export async function hasAiQuota(userId: string): Promise<boolean> {
  await dbConnect();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const query: Record<string, any> = {
    userId,
    createdAt: { $gte: oneDayAgo },
  };
  const count = await AiCallLog.countDocuments(query);
  return count < 5;
}

/**
 * Gets the remaining AI calls for a user in the rolling 24-hour window.
 */
export async function getAiRemaining(userId: string): Promise<number> {
  await dbConnect();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const query: Record<string, any> = {
    userId,
    createdAt: { $gte: oneDayAgo },
  };
  const count = await AiCallLog.countDocuments(query);
  return Math.max(0, 5 - count);
}

/**
 * Logs a new AI call along with its result and lookup key.
 */
export async function logAiCall(userId: string, action: string, key: string, result: unknown): Promise<void> {
  await dbConnect();
  await AiCallLog.create({
    userId,
    action,
    key,
    result,
    createdAt: new Date(),
  });
}
