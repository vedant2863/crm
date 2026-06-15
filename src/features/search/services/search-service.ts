/**
 * features/search/services/search-service.ts
 *
 * Pure DB layer for global search.
 * No Next.js imports — fully framework-independent.
 */
import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/contact";
import Deal from "@/models/deal";
import Task from "@/models/task";

export interface SearchOptions {
  userId: string;
  query: string;
  limit?: number;
}

/** Cross-entity search across contacts, deals, and tasks */
export async function searchAll({ userId, query, limit = 20 }: SearchOptions) {
  await dbConnect();

  if (!query || query.trim().length < 2) {
    return { contacts: [], deals: [], tasks: [], totalResults: 0, query };
  }

  const re = { $regex: query, $options: "i" };
  const perEntity = Math.ceil(limit / 3);

  const [contacts, deals, tasks] = await Promise.all([
    Contact.find({
      userId,
      $or: [{ name: re }, { email: re }, { company: re }, { phone: re }],
    })
      .select("name email company phone status")
      .limit(perEntity),

    Deal.find({
      userId,
      $or: [{ title: re }, { description: re }, { contactName: re }, { company: re }],
    })
      .select("title value stage contactName company probability")
      .limit(perEntity),

    Task.find({
      userId,
      $or: [{ title: re }, { description: re }],
    })
      .select("title status priority dueDate")
      .populate("contactId", "name")
      .populate("dealId", "title")
      .limit(perEntity),
  ]);

  const results = {
    contacts: contacts.map((c) => ({
      id: c._id,
      type: "contact",
      title: c.name,
      subtitle: c.company || c.email,
      status: c.status,
      url: `/contacts`,
    })),
    deals: deals.map((d) => ({
      id: d._id,
      type: "deal",
      title: d.title,
      subtitle: `$${d.value.toLocaleString()} · ${d.stage}`,
      status: d.stage,
      url: `/deals`,
    })),
    tasks: tasks.map((t) => ({
      id: t._id,
      type: "task",
      title: t.title,
      subtitle: `${t.priority} priority · ${t.status}`,
      status: t.status,
      url: `/tasks`,
    })),
  };

  return {
    results,
    totalResults: contacts.length + deals.length + tasks.length,
    query,
  };
}
