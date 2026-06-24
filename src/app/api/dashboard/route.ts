import { getServerSession } from "@/lib/auth/auth";
import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/contact";
import Deal from "@/models/deal";
import Task from "@/models/task";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession();
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
      { $match: { userId: String(userId) } },
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
        .select('title stage value updatedAt'),
      Task.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(3)
        .select('title status updatedAt'),
      Contact.find({ userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name company createdAt')
    ]);

    // Format recent activities using Date objects for sorting
    const rawActivities = [
      ...recentContacts.map(contact => ({
        id: contact._id.toString(),
        type: "contact",
        description: `New contact added: ${contact.name}${contact.company ? ` from ${contact.company}` : ''}`,
        date: contact.createdAt,
        value: 0
      })),
      ...recentDeals.map(deal => ({
        id: deal._id.toString(),
        type: "deal",
        description: `Deal "${deal.title}" moved to ${deal.stage}`,
        date: deal.updatedAt || deal.createdAt,
        value: deal.value
      })),
      ...recentTasks.map(task => ({
        id: task._id.toString(),
        type: "task",
        description: `Task "${task.title}" ${task.status === 'completed' ? 'completed' : 'updated'}`,
        date: task.updatedAt || task.createdAt,
        value: 0
      }))
    ];

    rawActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

    const recentActivities = rawActivities.slice(0, 5).map(act => ({
      id: act.id,
      type: act.type,
      description: act.description,
      timestamp: formatTimeAgo(act.date),
      dateStr: new Date(act.date).toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: 'numeric' }),
      timeStr: new Date(act.date).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }),
      value: act.value
    }));

    // Get task statistics
    const taskStats = await Task.aggregate([
      { $match: { userId: String(userId) } },
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

    // 1. Fetch upcoming uncompleted tasks as follow-ups
    const upcomingTasks = await Task.find({
      userId,
      status: { $ne: "completed" }
    })
      .sort({ dueDate: 1 })
      .limit(3)
      .populate("contactId", "name")
      .lean();

    const upcomingFollowups = upcomingTasks.map((t: unknown) => {
      const task = t as { _id: mongoose.Types.ObjectId; title: string; priority: string; dueDate?: Date; contactId?: { name?: string } };
      return {
        id: task._id.toString(),
        title: task.title,
        priority: task.priority,
        date: task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: 'numeric' }) : "No date",
        contact: task.contactId?.name || "No contact"
      };
    });

    // 2. Fetch monthly leads added in the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyEngagementAgg = await Deal.aggregate([
      {
        $match: {
          userId: String(userId),
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const engagementMap = new Map<string, number>();
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - 5 + i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      engagementMap.set(key, 0);
    }

    monthlyEngagementAgg.forEach(item => {
      const monthIdx = item._id.month - 1;
      const yearShort = item._id.year.toString().substring(2);
      const key = `${monthNames[monthIdx]} ${yearShort}`;
      if (engagementMap.has(key)) {
        engagementMap.set(key, item.count);
      }
    });

    const monthlyEngagement = Array.from(engagementMap.entries()).map(([month, count]) => ({
      month,
      count
    }));

    // 3. Fetch cumulative revenue progress (won deals over time)
    const wonDealsList = await Deal.find({
      userId,
      stage: "won"
    })
      .sort({ updatedAt: 1 })
      .select("value updatedAt")
      .lean();

    let cumulativeRevenue = 0;
    const revenueProgress = wonDealsList.map((item: unknown, index: number) => {
      const deal = item as { value: number; updatedAt?: Date; createdAt: Date };
      cumulativeRevenue += deal.value;
      return {
        day: (index + 1).toString(),
        value: cumulativeRevenue,
        date: new Date(deal.updatedAt || deal.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      };
    });

    const revenueProgressData = revenueProgress.length > 0 ? revenueProgress : [
      { day: "1", value: 0, date: "No data" }
    ];

    return NextResponse.json({
      dealStats,
      totalContacts,
      totalDeals,
      totalTasks,
      totalRevenue,
      conversionRate: Math.round(conversionRate * 100) / 100,
      recentActivities,
      pipelineStats,
      upcomingFollowups,
      monthlyEngagement,
      revenueProgressData,
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
  { key: "qualified", label: "Qualified" },
  { key: "proposal", label: "Proposal" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" }
];
