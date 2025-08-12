import { MongoClient } from "mongodb";
import { faker } from "@faker-js/faker";
import { useSession } from "next-auth/react";

// MongoDB connection URI and DB name (adjust as needed)
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "mydatabase";

// Function to generate one dummy contact
function generateDummyContact(userId: string) {
  return {
    userId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    company: faker.company.name(),
    position: faker.person.jobTitle(),
    status: faker.helpers.arrayElement(["active", "prospect", "inactive"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
  const { data: session } = useSession();


async function seedContacts(userId: string, count = 10) {
  if (!userId) {
    console.error("Please provide a valid userId");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const contactsCollection = db.collection("contacts");

    // Generate dummy contacts array
    const dummyContacts = Array.from({ length: count }, () =>
      generateDummyContact(userId)
    );

    // Insert into DB
    const result = await contactsCollection.insertMany(dummyContacts);
    console.log(
      `Inserted ${result.insertedCount} dummy contacts for user ${userId}`
    );
  } catch (error) {
    console.error("Error seeding contacts:", error);
  } finally {
    await client.close();
  }
}

// Run this script with userId argument
// Example: `ts-node seedcontact.ts someUserId`
const args = process.argv.slice(2);
const userId: string | undefined = session?.user?.id;

if (typeof userId === "string") {
  seedContacts(userId, 10).catch(console.error);
} else {
  console.error("Please provide a valid userId");
  process.exit(1);
}
