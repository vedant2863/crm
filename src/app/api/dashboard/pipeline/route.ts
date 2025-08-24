import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Deal from "@/models/deal";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const DEAL_STAGES = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userId = session.user.id;

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

    const pipelineStats = DEAL_STAGES.map((stage) => {
      const stat = dealStats.find((s) => s._id === stage.key);
      return {
        stage: stage.label,
        count: stat?.count || 0,
        value: stat?.totalValue || 0,
      };
    });

    return NextResponse.json({ pipelineStats });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
