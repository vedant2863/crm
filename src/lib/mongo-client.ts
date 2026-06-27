import { MongoClient } from "mongodb";
import envConfig from "@/lib/config/envconfig";

const uri = envConfig.db.uri;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
    var mongoClient: MongoClient | undefined;
    var mongoClientPromise: Promise<MongoClient> | undefined;
}

if (envConfig.app.isDev) {
    if (!global.mongoClient) {
        global.mongoClient = new MongoClient(uri);
        global.mongoClientPromise = global.mongoClient.connect();
    }
    client = global.mongoClient;
    clientPromise = global.mongoClientPromise!;
} else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
    return clientPromise;
}