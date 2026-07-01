/**
 * features/deals/services/deal-service.ts
 *
 * Pure DB layer for deals.
 * Separated from business logic and respects the collaborative sharing toggle.
 */
import dbConnect from "@/lib/dbConnect";
import Deal from "@/models/deal";
import User from "@/models/user";
import { getOrganizationUserIds } from "@/lib/org-cache";
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

/** List deals for an organization/user with optional search/stage filter + pagination */
export async function getDeals({ userId, search, stage, page = 1, limit = 50 }: DealFilters) {
  await dbConnect();
  const orgUserIds = await getOrganizationUserIds(userId);

  const safeLimit = Math.min(Math.max(1, limit), 50);
  const skip = (page - 1) * safeLimit;
  const query: Record<string, unknown> = { userId: { $in: orgUserIds } };

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
    Deal.find(query)
      .select("title description value stage probability expectedCloseDate contactName company assignedTo contactId userId priority tags notes lastActivity createdAt updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .maxTimeMS(10_000)
      .lean(),
    Deal.countDocuments(query).maxTimeMS(10_000),
  ]);

  const formatted = (deals as unknown as { _id: { toString(): string } }[]).map((d) => ({
    ...d,
    _id: d._id.toString(),
  }));

  return { deals: formatted, total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) };
}

/** Get a single deal by ID (scoped to organization/user) */
export async function getDealById(id: string, userId: string) {
  await dbConnect();
  const orgUserIds = await getOrganizationUserIds(userId);
  const deal = await Deal.findOne({ _id: id, userId: { $in: orgUserIds } })
    .maxTimeMS(10_000)
    .lean();
  if (!deal) throw new Error("NOT_FOUND");
  return deal;
}

/** Create a new deal */
export async function createDeal(userId: string, data: DealPayload) {
  await dbConnect();
  const user = await User.findById(userId).select("name email company role notifications").lean();
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
  await afterDealCreated(user, userId, deal);

  return deal;
}

/** Update an existing deal (scoped to organization/user) */
export async function updateDeal(id: string, userId: string, data: Partial<DealPayload>) {
  await dbConnect();
  const user = await User.findById(userId).select("name email company role notifications").lean();
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
  await afterDealUpdated(user, userId, oldDeal, updated);

  return updated;
}

/** Delete a deal (scoped to organization/user with RBAC) */
export async function deleteDeal(id: string, userId: string) {
  await dbConnect();
  const user = await User.findById(userId).select("name email company role notifications").lean();
  if (!user) throw new Error("USER_NOT_FOUND");

  const orgUserIds = await getOrganizationUserIds(userId);
  const deal = await Deal.findOne({ _id: id, userId: { $in: orgUserIds } });
  if (!deal) throw new Error("NOT_FOUND");

  // RBAC gates: Admin or Creator
  const isCreator = deal.userId.toString() === userId;
  const isAdmin = (user as { role?: string }).role === "admin";
  if (!isCreator && !isAdmin) {
    throw new Error("UNAUTHORIZED");
  }

  await Deal.findByIdAndDelete(id);

  // Delegate side-effect business logic hooks
  await afterDealDeleted(user, userId, deal);

  return { id };
}
