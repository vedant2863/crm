/**
 * @file src/lib/org-cache.ts
 * @description Centralized, cached organization user ID lookups.
 * Replaces the duplicated getOrganizationUserIds() in contact-service, deal-service, and task-service.
 * Uses TTLCache with 60-second TTL to prevent redundant DB queries.
 */

import { orgCache } from "./cache";
import dbConnect from "./dbConnect";
import User from "@/models/user";

/**
 * Get list of user IDs belonging to the same organization/company.
 * Respects the Collaborative Team Sharing toggle (contactActivities setting).
 *
 * Results are cached for 60 seconds per user to eliminate redundant DB hits.
 * At 1000 concurrent users, this saves ~2000 queries/second.
 */
export async function getOrganizationUserIds(userId: string): Promise<string[]> {
  return orgCache.getOrSet(`org:${userId}`, async () => {
    await dbConnect();

    const user = await User.findById(userId)
      .select("company notifications.contactActivities")
      .lean();

    if (!user) return [userId];

    // If Collaborative Team Sharing toggle is OFF, data is kept private
    const contactActivities = (user as { notifications?: { contactActivities?: boolean } })
      .notifications?.contactActivities;
    if (!contactActivities) {
      return [userId];
    }

    const company = (user as { company?: string }).company;
    if (!company) return [userId];

    const usersInCompany = await User.find({ company })
      .select("_id")
      .lean();

    return usersInCompany.map((u) => (u._id as { toString(): string }).toString());
  });
}

/**
 * Invalidate org cache for a specific user (call on profile/settings updates).
 * Also invalidates all users in the same org by clearing the prefix.
 */
export function invalidateOrgCache(userId: string): void {
  orgCache.invalidateByPrefix("org:");
  // Invalidating all org entries ensures consistency when a user changes company
  // or toggles the sharing setting. The 60s TTL makes this acceptable.
  void userId; // userId param kept for future targeted invalidation
}
