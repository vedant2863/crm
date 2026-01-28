import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/contact";
import Deal from "@/models/deal";
import Task from "@/models/task";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

function formatTimeAgo(date: Date) {
  const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userId = session.user.id;

    const [recentDeals, recentTasks, recentContacts] = await Promise.all([
      Deal.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(3)
        .select("title stage updatedAt"),
      Task.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(3)
        .select("title status updatedAt"),
      Contact.find({ userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select("name company createdAt"),
    ]);

    const recentActivities = [
      ...recentContacts.map((c) => ({
        id: c._id.toString(),
        type: "contact",
        description: c.name,
        timestamp: formatTimeAgo(c.createdAt),
      })),
      ...recentDeals.map((d) => ({
        id: d._id.toString(),
        type: "deal",
        description: d.title,
        timestamp: formatTimeAgo(d.updatedAt || d.createdAt),
      })),
      ...recentTasks.map((t) => ({
        id: t._id.toString(),
        type: "task",
        description: t.title,
        timestamp: formatTimeAgo(t.updatedAt || t.createdAt),
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 5);

    return NextResponse.json({ recentActivities });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
