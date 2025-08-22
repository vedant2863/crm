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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: {
          contacts: [],
          deals: [],
          tasks: []
        }
      });
    }

    const userId = session.user.id;
    const searchRegex = { $regex: query, $options: "i" };

    // Search in parallel for better performance
    const [contacts, deals, tasks] = await Promise.all([
      // Search contacts
      Contact.find({
        userId,
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { company: searchRegex },
          { phone: searchRegex }
        ]
      })
      .select('name email company phone status')
      .limit(Math.ceil(limit / 3)),

      // Search deals
      Deal.find({
        userId,
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { contactName: searchRegex },
          { company: searchRegex }
        ]
      })
      .select('title value stage contactName company probability')
      .limit(Math.ceil(limit / 3)),

      // Search tasks
      Task.find({
        userId,
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      })
      .select('title status priority dueDate')
      .populate('contactId', 'name')
      .populate('dealId', 'title')
      .limit(Math.ceil(limit / 3))
    ]);

    // Format results with type information
    const results = {
      contacts: contacts.map(contact => ({
        id: contact._id,
        type: 'contact',
        title: contact.name,
        subtitle: contact.company || contact.email,
        status: contact.status,
        url: `/contacts`
      })),
      deals: deals.map(deal => ({
        id: deal._id,
        type: 'deal',
        title: deal.title,
        subtitle: `$${deal.value.toLocaleString()} • ${deal.stage}`,
        status: deal.stage,
        url: `/deals`
      })),
      tasks: tasks.map(task => ({
        id: task._id,
        type: 'task',
        title: task.title,
        subtitle: `${task.priority} priority • ${task.status}`,
        status: task.status,
        url: `/tasks`
      }))
    };

    const totalResults = contacts.length + deals.length + tasks.length;

    return NextResponse.json({
      results,
      totalResults,
      query
    });

  } catch (error) {
    console.error("Error in search:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
