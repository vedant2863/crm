/**
 * features/contacts/api/handler.ts
 *
 * HTTP Translation Layer for contacts.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} from "../services/contact-service";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

export async function handleGetContacts(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const { searchParams } = new URL(req.url);
    const result = await getContacts({
      userId,
      search: searchParams.get("search"),
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 100),
    });
    return NextResponse.json({ contacts: result.contacts, pagination: result });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function handleCreateContact(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    if (!body.name || !body.email)
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    const contact = await createContact(userId, body);
    return NextResponse.json(contact, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof Error && err.message === "DUPLICATE_EMAIL")
      return NextResponse.json({ error: "Contact with this email already exists" }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function handleUpdateContact(req: NextRequest, id: string) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    if (!body.name || !body.email)
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    const contact = await updateContact(id, userId, body);
    return NextResponse.json({ contact });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof Error && err.message === "NOT_FOUND")
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function handleDeleteContact(_req: NextRequest, id: string) {
  try {
    const userId = await requireAuth();
    await deleteContact(id, userId);
    return NextResponse.json({ message: "Contact deleted successfully" });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof Error && err.message === "NOT_FOUND")
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
