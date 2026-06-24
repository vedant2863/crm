import { MongoClient } from "mongodb";
import envConfig from "@/lib/config/envconfig";

const uri = envConfig.MONGODB_URI;

declare global {
    var mongoClient: MongoClient | undefined;
}

export const client = envConfig.IS_DEV
    ? (global.mongoClient || (global.mongoClient = new MongoClient(uri)))
    : new MongoClient(uri);

if (envConfig.IS_DEV) {
    global.mongoClient = client;
}

export async function getMongoClient() {
    await client.connect();
    return client;
}