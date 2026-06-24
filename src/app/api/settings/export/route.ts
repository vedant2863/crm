/**
 * GET /api/settings/export
 *
 * Exports all user data (contacts, deals, tasks, notes) as a downloadable JSON file.
 * Responds with Content-Disposition: attachment so the browser triggers a file save.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/contact";
import Deal from "@/models/deal";
import Task from "@/models/task";
import Note from "@/models/note";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") ?? "json").toLowerCase();

    // Fetch all records owned by this user
    const [user, contacts, deals, tasks, notes] = await Promise.all([
      User.findById(userId).select("-password").lean(),
      Contact.find({ userId }).lean(),
      Deal.find({ userId }).lean(),
      Task.find({ userId }).lean(),
      Note.find({ userId }).lean(),
    ]);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user,
      contacts,
      deals,
      tasks,
      notes,
    };

    if (format === "csv") {
      // Flatten deals to CSV (most useful export format)
      const headers = ["title", "company", "contactName", "stage", "priority", "value", "probability", "notes", "createdAt"];
      const rows = (deals as unknown as Record<string, unknown>[]).map((d) =>
        headers.map((h) => {
          const v = d[h];
          if (v === null || v === undefined) return "";
          const str = String(v).replace(/"/g, '""');
          return `"${str}"`;
        }).join(",")
      );

      const csv = [headers.join(","), ...rows].join("\r\n");

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="crm-export-${Date.now()}.csv"`,
        },
      });
    }

    // Default: JSON
    const json = JSON.stringify(exportPayload, null, 2);

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="crm-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("Error in data export route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
