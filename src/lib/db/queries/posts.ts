import { db } from "../index.js";
import { eq, desc } from "drizzle-orm";
import { posts, feeds, NewPost, feed_follows, users } from "../schema.js";

export async function createPost(post: NewPost){
    await db.insert(posts).values(post).onConflictDoNothing();;
}

export async function getPostsForUser(userID: string, limit: number){
    const allPosts = await db.select({title: posts.title, description: posts.description, url: posts.url, publishedAt: posts.publishedAt, feed_id: posts.feed_id}).from(posts).innerJoin(feeds, eq(feeds.id, posts.feed_id)).innerJoin(feed_follows, eq(posts.feed_id, feed_follows.feed_id)).where(eq(feed_follows.user_id, userID)).orderBy(desc(posts.publishedAt)).limit(limit);
    return allPosts;
}