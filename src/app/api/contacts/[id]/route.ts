import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/contact";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/contacts/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Check session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // ✅ Get request body
    const body = await request.json();
    const { name, email, phone, company, position, status } = body;

    // ✅ Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // ✅ Connect to database
    await dbConnect();

    // ✅ Update the contact (only if owned by the current user)
    const updatedContact = await Contact.findOneAndUpdate(
      {
        _id: id,
        userId: session.user.id, // Ensures users can update only their contacts
      },
      {
        name,
        email,
        phone: phone || "",
        company: company || "",
        position: position || "",
        status: status || "prospect",
      },
      { new: true } // Return the updated document
    );

    if (!updatedContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ contact: updatedContact }, { status: 200 });
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Check session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // ✅ Connect to database
    await dbConnect();

    // ✅ Delete the contact (only if owned by the current user)
    const deleted = await Contact.findOneAndDelete({
      _id: id,
      userId: session.user.id, // Ensures users can delete only their contacts
    });

    if (!deleted) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Contact deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
