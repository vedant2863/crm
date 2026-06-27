/**
 * features/deals/services/deal-service.ts
 *
 * Pure DB layer for deals.
 * Separated from business logic and respects the collaborative sharing toggle.
 */
import dbConnect from "@/lib/dbConnect";
import Deal from "@/models/deal";
import User from "@/models/user";
import {
  afterDealCreated,
  afterDealUpdated,
  afterDealDeleted,
} from "@/features/enterprise/services/business-logic";

export interface DealFilters {
  userId: string;
  search?: string | null;
  stage?: string | null;
  page?: number;
  limit?: number;
}

export interface DealPayload {
  title: string;
  description?: string;
  value: number;
  stage?: string;
  probability?: number;
  expectedCloseDate?: string;
  contactName?: string;
  company?: string;
  assignedTo?: string;
  tags?: string[];
  notes?: string;
  priority?: string;
}

/** Get list of user IDs belonging to the same organization/company (respects privacy toggle) */
async function getOrganizationUserIds(userId: string): Promise<string[]> {
  const user = await User.findById(userId);
  if (!user) return [userId];

  // If Collaborative Team Sharing toggle is OFF, deals are kept private
  if (!user.notifications?.contactActivities) {
    return [userId];
  }

  if (!user.company) return [userId];
  const usersInCompany = await User.find({ company: user.company }).select("_id");
  return usersInCompany.map((u) => u._id.toString());
}

/** List deals for an organization/user with optional search/stage filter + pagination */
export async function getDeals({ userId, search, stage, page = 1, limit = 100 }: DealFilters) {
  await dbConnect();
  const orgUserIds = await getOrganizationUserIds(userId);

  const skip = (page - 1) * limit;
  const query: any = { userId: { $in: orgUserIds } };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { contactName: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (stage && stage !== "all") {
    query.stage = stage;
  }

  const [deals, total] = await Promise.all([
    Deal.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Deal.countDocuments(query),
  ]);

  const formatted = (deals as unknown as { _id: { toString(): string } }[]).map((d) => ({
    ...d,
    _id: d._id.toString(),
  }));

  return { deals: formatted, total, page, limit, pages: Math.ceil(total / limit) };
}

/** Get a single deal by ID (scoped to organization/user) */
export async function getDealById(id: string, userId: string) {
  await dbConnect();
  const orgUserIds = await getOrganizationUserIds(userId);
  const deal = await Deal.findOne({ _id: id, userId: { $in: orgUserIds } });
  if (!deal) throw new Error("NOT_FOUND");
  return deal;
}

/** Create a new deal */
export async function createDeal(userId: string, data: DealPayload) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const deal = new Deal({
    ...data,
    stage: data.stage || "new",
    probability: data.probability || 0,
    priority: data.priority || "medium",
    expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
    userId,
    lastActivity: new Date().toISOString(),
  });

  await deal.save();

  // Delegate side-effect business logic hooks
  await afterDealCreated(userId, deal);

  return deal;
}

/** Update an existing deal (scoped to organization/user) */
export async function updateDeal(id: string, userId: string, data: Partial<DealPayload>) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const orgUserIds = await getOrganizationUserIds(userId);
  const existingDeal = await Deal.findOne({ _id: id, userId: { $in: orgUserIds } });
  if (!existingDeal) throw new Error("NOT_FOUND");

  const oldDeal = { ...existingDeal.toObject() };

  const updated = await Deal.findOneAndUpdate(
    { _id: id },
    {
      ...data,
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
      lastActivity: new Date().toISOString(),
    },
    { new: true }
  );

  if (!updated) throw new Error("NOT_FOUND");

  // Delegate side-effect business logic hooks
  await afterDealUpdated(userId, oldDeal, updated);

  return updated;
}

/** Delete a deal (scoped to organization/user with RBAC) */
export async function deleteDeal(id: string, userId: string) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const orgUserIds = await getOrganizationUserIds(userId);
  const deal = await Deal.findOne({ _id: id, userId: { $in: orgUserIds } });
  if (!deal) throw new Error("NOT_FOUND");

  // RBAC gates: Admin or Creator
  const isCreator = deal.userId.toString() === userId;
  const isAdmin = user.role === "admin";
  if (!isCreator && !isAdmin) {
    throw new Error("UNAUTHORIZED");
  }

  await Deal.findByIdAndDelete(id);

  // Delegate side-effect business logic hooks
  await afterDealDeleted(userId, deal);

  return { id };
}
