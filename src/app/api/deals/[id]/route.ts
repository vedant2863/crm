import { NextRequest, NextResponse } from "next/server";
import Deal from "@/models/deal";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET deal by ID
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

    const deal = await Deal.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json({ deal });
  } catch (error) {
    console.error("Error getting deal:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// UPDATE deal
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
      value,
      stage,
      probability,
      expectedCloseDate,
      contactName,
      company,
      assignedTo,
      tags,
      notes,
      priority,
    } = body;

    const updatedDeal = await Deal.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        title,
        description,
        value,
        stage,
        probability,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        contactName,
        company,
        assignedTo,
        tags,
        notes,
        priority,
        lastActivity: new Date().toISOString(),
      },
      { new: true }
    );

    if (!updatedDeal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json({ deal: updatedDeal });
  } catch (error) {
    console.error("Error updating deal:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE deal
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

    const deal = await Deal.findOneAndDelete({
      _id: id,
      userId: session.user.id
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deal deleted successfully" });
  } catch (error) {
    console.error("Error deleting deal:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
