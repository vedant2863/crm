/**
 * features/contacts/services/contact-service.ts
 *
 * Scoped DB layer for contacts.
 * Separated from business logic and respects the collaborative sharing toggle.
 */
import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/contact";
import User from "@/models/user";
import { getOrganizationUserIds } from "@/lib/org-cache";
import {
  afterContactCreated,
  afterContactUpdated,
  afterContactDeleted,
} from "@/features/enterprise/services/business-logic";

export interface ContactFilters {
  userId: string;
  search?: string | null;
  page?: number;
  limit?: number;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  tags?: string[];
  notes?: string;
  status?: string;
}

export interface ContactUpdatePayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status?: string;
}

/** List contacts for an organization/user with optional search + pagination */
export async function getContacts({ userId, search, page = 1, limit = 50 }: ContactFilters) {
  await dbConnect();
  const orgUserIds = await getOrganizationUserIds(userId);

  const safeLimit = Math.min(Math.max(1, limit), 50);
  const skip = (page - 1) * safeLimit;
  const query: Record<string, unknown> = { userId: { $in: orgUserIds } };
  if (search) query.$text = { $search: search };

  const [contacts, total] = await Promise.all([
    Contact.find(query)
      .select("name email phone company status position tags notes userId createdAt updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .maxTimeMS(10_000)
      .lean(),
    Contact.countDocuments(query).maxTimeMS(10_000),
  ]);

  // Map _id to string for react key consistency (NextJS serialization)
  const formatted = (contacts as unknown as { _id: { toString(): string } }[]).map((c) => ({
    ...c,
    _id: c._id.toString(),
  }));

  return { contacts: formatted, total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) };
}

/** Create a new contact */
export async function createContact(userId: string, data: ContactPayload) {
  await dbConnect();
  const user = await User.findById(userId).select("name email company role notifications").lean();
  if (!user) throw new Error("USER_NOT_FOUND");

  const orgUserIds = await getOrganizationUserIds(userId);
  const existing = await Contact.findOne({ userId: { $in: orgUserIds }, email: data.email }).lean();
  if (existing) throw new Error("DUPLICATE_EMAIL");

  const contact = await Contact.create({
    ...data,
    status: data.status || "active",
    tags: Array.isArray(data.tags) ? data.tags : [],
    userId,
  });

  // Delegate side-effect business logic hooks (pass user to avoid re-fetch)
  await afterContactCreated(user, userId, contact);

  return contact;
}

/** Update an existing contact (scoped to organization/user) */
export async function updateContact(id: string, userId: string, data: ContactUpdatePayload) {
  await dbConnect();
  const user = await User.findById(userId).select("name email company role notifications").lean();
  if (!user) throw new Error("USER_NOT_FOUND");

  const orgUserIds = await getOrganizationUserIds(userId);
  const existingContact = await Contact.findOne({ _id: id, userId: { $in: orgUserIds } });
  if (!existingContact) throw new Error("NOT_FOUND");

  const oldContact = { ...existingContact.toObject() };
  const newStatus = data.status || "active";

  const updated = await Contact.findOneAndUpdate(
    { _id: id },
    {
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      company: data.company || "",
      position: data.position || "",
      status: newStatus,
    },
    { new: true }
  );

  if (!updated) throw new Error("NOT_FOUND");

  // Delegate side-effect business logic hooks
  await afterContactUpdated(user, userId, oldContact, updated);

  return updated;
}

/** Delete a contact (with RBAC - Admin or Creator only) */
export async function deleteContact(id: string, userId: string) {
  await dbConnect();
  const user = await User.findById(userId).select("name email company role notifications").lean();
  if (!user) throw new Error("USER_NOT_FOUND");

  const orgUserIds = await getOrganizationUserIds(userId);
  const contact = await Contact.findOne({ _id: id, userId: { $in: orgUserIds } });
  if (!contact) throw new Error("NOT_FOUND");

  // RBAC enforcement: Creator or Admin only
  const isCreator = contact.userId.toString() === userId;
  const isAdmin = (user as { role?: string }).role === "admin";
  if (!isCreator && !isAdmin) {
    throw new Error("UNAUTHORIZED");
  }

  await Contact.findByIdAndDelete(id);

  // Delegate side-effect business logic hooks
  await afterContactDeleted(user, userId, contact);

  return { id };
}
