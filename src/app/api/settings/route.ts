import { NextRequest } from "next/server";
import {
  handleGetSettings,
  handleUpdateSettings,
  handleSettingsAction,
} from "@/features/settings/api/handler";

export async function GET() {
  return handleGetSettings();
}

export async function PUT(req: NextRequest) {
  return handleUpdateSettings(req);
}

export async function POST(req: NextRequest) {
  return handleSettingsAction(req);
}
