import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/contact";
import Deal from "@/models/deal";
import Task from "@/models/task";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userId = session.user.id;

    // Get counts
    const [totalContacts, totalDeals, totalTasks] = await Promise.all([
      Contact.countDocuments({ userId }),
      Deal.countDocuments({ userId }),
      Task.countDocuments({ userId })
    ]);

    // Get deal statistics
    const dealStats = await Deal.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
          totalValue: { $sum: "$value" },
          avgProbability: { $avg: "$probability" }
        }
      }
    ]);

    // Calculate total revenue (won deals)
    const totalRevenue = dealStats
      .filter(stat => stat._id === "won")
      .reduce((sum, stat) => sum + stat.totalValue, 0);

    // Calculate conversion rate
    const totalLeads = dealStats.reduce((sum, stat) => sum + stat.count, 0);
    const wonDeals = dealStats.find(stat => stat._id === "won")?.count || 0;
    const conversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;

    // Get recent activities (latest deals and tasks)
    const [recentDeals, recentTasks, recentContacts] = await Promise.all([
      Deal.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(3)
        .select('title stage updatedAt'),
      Task.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(3)
        .select('title status updatedAt'),
      Contact.find({ userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name company createdAt')
    ]);

    // Format recent activities
    const recentActivities = [
      ...recentContacts.map(contact => ({
        id: contact._id.toString(),
        type: "contact",
        description: `New contact added: ${contact.name}${contact.company ? ` from ${contact.company}` : ''}`,
        timestamp: formatTimeAgo(contact.createdAt)
      })),
      ...recentDeals.map(deal => ({
        id: deal._id.toString(),
        type: "deal",
        description: `Deal "${deal.title}" moved to ${deal.stage}`,
        timestamp: formatTimeAgo(deal.updatedAt || deal.createdAt)
      })),
      ...recentTasks.map(task => ({
        id: task._id.toString(),
        type: "task",
        description: `Task "${task.title}" ${task.status === 'completed' ? 'completed' : 'updated'}`,
        timestamp: formatTimeAgo(task.updatedAt || task.createdAt)
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

    // Get task statistics
    const taskStats = await Task.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Pipeline stats for chart
    const pipelineStats = DEAL_STAGES.map(stage => {
      const stat = dealStats.find(s => s._id === stage.key);
      return {
        stage: stage.label,
        count: stat?.count || 0,
        value: stat?.totalValue || 0
      };
    });

    return NextResponse.json({
      totalContacts,
      totalDeals,
      totalTasks,
      totalRevenue,
      conversionRate: Math.round(conversionRate * 100) / 100,
      recentActivities,
      pipelineStats,
      taskStats: taskStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>)
    });
  } catch (error) {
    console.error("Error in GET dashboard:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

const DEAL_STAGES = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" }
];
