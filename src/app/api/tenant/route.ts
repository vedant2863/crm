import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const subdomain = searchParams.get("subdomain");
    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain parameter is required" },
        { status: 400 }
      );
    }

    // Lookup user where first name or company matches subdomain case-insensitively
    const cleanSubdomain = subdomain.trim().toLowerCase();
    const escapedSubdomain = cleanSubdomain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    
    // Find matching user in the database
    const user = await User.findOne({
      $or: [
        { name: { $regex: new RegExp("^" + escapedSubdomain, "i") } },
        { company: { $regex: new RegExp("^" + escapedSubdomain + "$", "i") } },
      ],
    }).select("name company");

    if (!user) {
      return NextResponse.json(
        { error: "Tenant organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: user.name,
      company: user.company || "Enterprise Tenant",
    });
  } catch (err) {
    console.error("Error fetching subdomain tenant info:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
