import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Deal from "@/models/deal";
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
    const stage = searchParams.get("stage");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {
      userId: session.user.id,
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { contactName: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Add stage filter
    if (stage && stage !== "all") {
      query.stage = stage;
    }

    const deals = await Deal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Deal.countDocuments(query);

    return NextResponse.json({
      deals: deals,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET deals:", error);
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

    // Validation
    if (!title || !value) {
      return NextResponse.json(
        { error: "Title and value are required" },
        { status: 400 }
      );
    }

    const newDeal = new Deal({
      title,
      description,
      value,
      stage: stage || "new",
      probability: probability || 0,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      contactName,
      company,
      assignedTo,
      tags,
      notes,
      priority: priority || "medium",
      userId: session.user.id,
      lastActivity: new Date().toISOString(),
    });

    await newDeal.save();

    return NextResponse.json({ deal: newDeal }, { status: 201 });
  } catch (error) {
    console.error("Error in POST deals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
