import { db } from "../index.js";
import { feeds } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string){
    const [result] = await db.insert(feeds).values({name: name, url: url, user_id: userId}).returning();
    return result;
}

export async function selectFeeds(){
    const result = await db.select().from(feeds);
    return result;
}

export async function getFeed(url: string){
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}