import { NextRequest, NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seedData";

export async function POST(request: NextRequest) {
  // Only allow seeding in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: "Seeding is not allowed in production" },
      { status: 403 }
    );
  }

  try {
    const result = await seedDatabase();
    
    return NextResponse.json({
      message: "Database seeded successfully",
      data: {
        users: result.users.length,
        contacts: result.contacts.length,
        deals: result.deals.length,
        tasks: result.tasks.length
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Seed endpoint is available. Use POST to seed the database.",
    note: "Only available in development mode"
  });
}
