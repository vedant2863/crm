import { NextRequest } from "next/server";
import { handleGetContacts, handleCreateContact } from "@/features/contacts/api/handler";

export async function GET(req: NextRequest) {
  return handleGetContacts(req);
}

export async function POST(req: NextRequest) {
  return handleCreateContact(req);
}
