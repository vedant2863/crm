import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { validateObjectId } from "@/lib/validation";
import { updateContact, deleteContact } from "@/features/contacts/services/contact-service";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { id } = await params;
    validateObjectId(id);

    const body = await req.json();
    if (!body.name || !body.email) {
      throw AppError.validationFailed("Name and email are required");
    }

    const contact = await updateContact(id, session.user.id, body);
    return NextResponse.json({ contact });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { id } = await params;
    validateObjectId(id);

    await deleteContact(id, session.user.id);
    return NextResponse.json({ message: "Contact deleted successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
