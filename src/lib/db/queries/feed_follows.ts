import { db } from "../index.js";
import { feed_follows, feeds, users } from "../schema.js";
import { and, eq } from "drizzle-orm";

export async function createFeedFollow(user_id: string, feed_id: string){
    const [newFeedFollow] = await db.insert(feed_follows).values({user_id: user_id, feed_id: feed_id}).returning();
    const [feedUser] = await db.select({id: feed_follows.id,
                                        createdAt: feed_follows.createdAt,
                                        updatedAt: feed_follows.updatedAt,
                                        userID: feed_follows.user_id,
                                        feedID: feed_follows.feed_id,
                                        usersName: users.name,
                                        feedName: feeds.name,
                                        feedUrl: feeds.url
                                    }).from(feed_follows).innerJoin(feeds, eq(feed_follows.feed_id, feeds.id)).innerJoin(users, eq(feed_follows.user_id, users.id)).where(eq(feed_follows.id, newFeedFollow.id));

    return feedUser;
}

export async function getFeedFollowsForUser(user_id: string){
    const feedList = await db.select({feedName: feeds.name}).from(feed_follows).innerJoin(feeds, eq(feed_follows.feed_id, feeds.id)).where(eq(feed_follows.user_id, user_id));
    return feedList;
}

export async function deleteFeedFollows(user_id: string, feed_id: string){
    await db.delete(feed_follows).where(and(eq(feed_follows.user_id, user_id), eq(feed_follows.feed_id, feed_id)));
}