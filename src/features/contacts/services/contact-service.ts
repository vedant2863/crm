/**
 * features/contacts/services/contact-service.ts
 *
 * Scoped DB layer for contacts.
 * Separated from business logic and respects the collaborative sharing toggle.
 */
import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/contact";
import User from "@/models/user";
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

/** Get list of user IDs belonging to the same organization/company (respects privacy toggle) */
async function getOrganizationUserIds(userId: string): Promise<string[]> {
  const user = await User.findById(userId);
  if (!user) return [userId];

  // If Collaborative Team Sharing toggle is OFF, contacts are kept private
  if (!user.notifications?.contactActivities) {
    return [userId];
  }

  if (!user.company) return [userId];
  const usersInCompany = await User.find({ company: user.company }).select("_id");
  return usersInCompany.map((u) => u._id.toString());
}

/** List contacts for an organization/user with optional search + pagination */
export async function getContacts({ userId, search, page = 1, limit = 100 }: ContactFilters) {
  await dbConnect();
  const orgUserIds = await getOrganizationUserIds(userId);

  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = { userId: { $in: orgUserIds } };
  if (search) query.$text = { $search: search };

  const [contacts, total] = await Promise.all([
    Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Contact.countDocuments(query),
  ]);

  // Map _id to string for react key consistency (NextJS serialization)
  const formatted = (contacts as unknown as { _id: { toString(): string } }[]).map((c) => ({
    ...c,
    _id: c._id.toString(),
  }));

  return { contacts: formatted, total, page, limit, pages: Math.ceil(total / limit) };
}

/** Create a new contact */
export async function createContact(userId: string, data: ContactPayload) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const orgUserIds = await getOrganizationUserIds(userId);
  const existing = await Contact.findOne({ userId: { $in: orgUserIds }, email: data.email });
  if (existing) throw new Error("DUPLICATE_EMAIL");

  const contact = await Contact.create({
    ...data,
    status: data.status || "active",
    tags: Array.isArray(data.tags) ? data.tags : [],
    userId,
  });

  // Delegate side-effect business logic hooks
  await afterContactCreated(userId, contact);

  return contact;
}

/** Update an existing contact (scoped to organization/user) */
export async function updateContact(id: string, userId: string, data: ContactUpdatePayload) {
  await dbConnect();
  const user = await User.findById(userId);
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
  await afterContactUpdated(userId, oldContact, updated);

  return updated;
}

/** Delete a contact (with RBAC - Admin or Creator only) */
export async function deleteContact(id: string, userId: string) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const orgUserIds = await getOrganizationUserIds(userId);
  const contact = await Contact.findOne({ _id: id, userId: { $in: orgUserIds } });
  if (!contact) throw new Error("NOT_FOUND");

  // RBAC enforcement: Creator or Admin only
  const isCreator = contact.userId.toString() === userId;
  const isAdmin = user.role === "admin";
  if (!isCreator && !isAdmin) {
    throw new Error("UNAUTHORIZED");
  }

  await Contact.findByIdAndDelete(id);

  // Delegate side-effect business logic hooks
  await afterContactDeleted(userId, contact);

  return { id };
}
