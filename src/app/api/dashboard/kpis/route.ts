import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/contact";
import Deal from "@/models/deal";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userId = session.user.id;

    const [totalContacts, totalDeals] = await Promise.all([
      Contact.countDocuments({ userId }),
      Deal.countDocuments({ userId }),
    ]);

    // Deal stats for revenue & conversion
    const dealStats = await Deal.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
          totalValue: { $sum: "$value" },
        },
      },
    ]);

    const totalRevenue = dealStats
      .filter((s) => s._id === "won")
      .reduce((sum, s) => sum + s.totalValue, 0);
    const totalLeads = dealStats.reduce((sum, s) => sum + s.count, 0);
    const wonDeals = dealStats.find((s) => s._id === "won")?.count || 0;
    const conversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;

    return NextResponse.json({
      totalContacts,
      totalDeals,
      totalRevenue,
      conversionRate: Math.round(conversionRate * 100) / 100,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
