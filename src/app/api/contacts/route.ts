import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { validatePagination, sanitizeString } from "@/lib/validation";
import { getContacts, createContact } from "@/features/contacts/services/contact-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { searchParams } = new URL(req.url);
    const { page, limit } = validatePagination({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });
    const search = sanitizeString(searchParams.get("search"), 200) || undefined;

    const result = await getContacts({ userId: session.user.id, search, page, limit });
    return NextResponse.json({ contacts: result.contacts, pagination: result });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const body = await req.json();
    if (!body.name || !body.email) {
      throw AppError.validationFailed("Name and email are required");
    }

    const contact = await createContact(session.user.id, body);
    return NextResponse.json(contact, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
