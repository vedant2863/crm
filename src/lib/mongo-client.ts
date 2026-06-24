import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

declare global {
    var mongoClient: MongoClient | undefined;
}

export const client = process.env.NODE_ENV === "development"
    ? (global.mongoClient || (global.mongoClient = new MongoClient(uri)))
    : new MongoClient(uri);

if (process.env.NODE_ENV === "development") {
    global.mongoClient = client;
}

export async function getMongoClient() {
    await client.connect();
    return client;
}