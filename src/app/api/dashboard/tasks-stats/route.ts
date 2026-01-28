import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Task from "@/models/task";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userId = session.user.id;

    const stats = await Task.aggregate([
      { $match: { userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const taskStats = stats.reduce(
      (acc, s) => ({ ...acc, [s._id]: s.count }),
      {} as Record<string, number>
    );

    return NextResponse.json({ taskStats });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
