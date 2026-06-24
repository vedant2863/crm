import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seedData";

export async function POST() {
  try {
    const result = await seedDatabase();

    return NextResponse.json({
      message: "Database seeded successfully",
      data: {
        users: result.userId ? 1 : 0,
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
    note: "Safe to run in both development and production (targets only admin user data)"
  });
}
