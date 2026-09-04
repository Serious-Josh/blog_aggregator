import { db } from "../index.js";
import { feeds } from "../schema.js";
import { eq, sql } from "drizzle-orm";

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

export async function markFeedFetched(id: string){
    await db.update(feeds).set({lastFetchedAt: new Date()}).where(eq(feeds.id, id));
}

export async function getNextFeedToFetch(){
    const feed = await db.select().from(feeds).orderBy(sql`${feeds.lastFetchedAt} asc nulls first`).limit(1);
    return feed[0];
}