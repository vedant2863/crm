import { NextRequest } from "next/server";
import { handleUpdateContact, handleDeleteContact } from "@/features/contacts/api/handler";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateContact(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteContact(req, id);
}
