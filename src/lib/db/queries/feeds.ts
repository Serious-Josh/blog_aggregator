import { readConfig } from "../../../config.js";
import { db } from "../index.js";
import { feeds } from "../schema.js";
import { getUser } from "./users.js";

export async function createFeed(name: string, url: string, userId: string){
    const [result] = await db.insert(feeds).values({name: name, url: url, user_id: userId}).returning();
    return result;
}