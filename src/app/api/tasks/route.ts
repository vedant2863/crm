import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import { IDeal } from "@/models/deal";
import Task from "@/models/task";
import { FilterQuery } from "mongoose";
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
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build query
    // const query: { userId: string; $text?: { $search: string } } = {
    //   userId: session.user.id,
    // };

    const query: FilterQuery<IDeal> = { userId: session.user.id };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Add status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Add priority filter
    if (priority && priority !== "all") {
      query.priority = priority;
    }

    const tasks = await Task.find(query)
      .populate('contactId', 'name company')
      .populate('dealId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    return NextResponse.json({
      tasks: tasks,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET tasks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const {
      title,
      description,
      dueDate,
      priority,
      status,
      assignedTo,
      contactId,
      dealId,
      tags,
    } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const newTask = new Task({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "medium",
      status: status || "pending",
      assignedTo: assignedTo || session.user.id,
      contactId: contactId || null,
      dealId: dealId || null,
      userId: session.user.id,
      tags: tags || [],
    });

    await newTask.save();

    // Populate the task before returning
    const populatedTask = await Task.findById(newTask._id)
      .populate('contactId', 'name company')
      .populate('dealId', 'title');

    return NextResponse.json({ task: populatedTask }, { status: 201 });
  } catch (error) {
    console.error("Error in POST tasks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
