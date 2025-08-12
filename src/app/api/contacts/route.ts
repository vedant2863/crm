import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/contact";

// GET /api/contacts - Get all contacts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build query
    let query: any = { userId: session.user.id };

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .select("-userId");

    const total = await Contact.countDocuments(query);

    return NextResponse.json({
      "contacts": contacts,
      "pagination": {
        "page": page,
        "limit": limit,
        "total": total,
        "pages": Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { name, email, phone, company, position, tags, notes } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if contact with same email already exists for this user
    const existingContact = await Contact.findOne({
      userId: session.user.id,
      email,
    });

    if (existingContact) {
      return NextResponse.json(
        { error: "Contact with this email already exists" },
        { status: 400 }
      );
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      company,
      position,
      tags: Array.isArray(tags) ? tags : [],
      notes,
      userId: session.user.id,
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Create contact error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
