import { NextRequest, NextResponse } from "next/server";
import Task from "@/models/task";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET task by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const task = await Task.findOne({
      _id: id,
      userId: session.user.id
    })
      .populate('contactId', 'name company')
      .populate('dealId', 'title');

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error getting task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// UPDATE task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

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

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        status,
        assignedTo,
        contactId: contactId || null,
        dealId: dealId || null,
        tags: tags || [],
      },
      { new: true }
    )
      .populate('contactId', 'name company')
      .populate('dealId', 'title');

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const task = await Task.findOneAndDelete({
      _id: id,
      userId: session.user.id
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
