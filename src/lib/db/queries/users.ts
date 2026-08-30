import { db } from "../index.js";
import { eq } from "drizzle-orm";
import { users } from "../schema.js";

export async function createUser(name: string){
    const [result] = await db.insert(users).values({name: name}).returning();
    return result;
}

export async function getUser(name: string){
    const[result] = await db.select().from(users).where(eq(users.name, name))
    return result;
}

export async function clearUsers(){
    await db.delete(users);
}

export async function selectUsers(){
    const result = await db.select().from(users);
    return result;
}