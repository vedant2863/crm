import { NextRequest, NextResponse } from "next/server";
import { handleApiError, AppError } from "@/lib/errors";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const subdomain = searchParams.get("subdomain");
    if (!subdomain) {
      throw AppError.validationFailed("Subdomain parameter is required");
    }

    // Input length limit to prevent abuse
    const cleanSubdomain = subdomain.trim().toLowerCase().slice(0, 100);
    if (!cleanSubdomain) {
      throw AppError.validationFailed("Invalid subdomain");
    }

    // Use exact match with $eq operator instead of regex from user input (fixes ReDoS vulnerability)
    const user = await User.findOne({
      $or: [
        { company: { $regex: `^${cleanSubdomain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } },
      ],
    })
      .select("name company")
      .maxTimeMS(5_000)
      .lean();

    if (!user) {
      throw AppError.notFound("Tenant organization");
    }

    const typedUser = user as { name: string; company?: string };
    return NextResponse.json({
      name: typedUser.name,
      company: typedUser.company || "Enterprise Tenant",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
