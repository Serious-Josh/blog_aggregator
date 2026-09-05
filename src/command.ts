import { readConfig, setUser } from "./config.js";
import { createUser, getUser, clearUsers, selectUsers, getUserFromUUID } from "./lib/db/queries/users.js";
import { exit } from "node:process";
import { feedFetch } from "./rss.js";
import { createFeed, getFeed, getNextFeedToFetch, markFeedFetched, selectFeeds } from "./lib/db/queries/feeds.js";
import { feeds, users, NewPost } from "./lib/db/schema.js";
import { createFeedFollow, deleteFeedFollows, getFeedFollowsForUser } from "./lib/db/queries/feed_follows.js";
import { createPost, getPostsForUser } from "./lib/db/queries/posts.js";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;
export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;
type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;
type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;


// -----------------
// Users
// -----------------

export async function handlerLogin(cmdName: string, ...args: string[]){
    if(args[0] == null){
        throw new Error("Username required for login. Exiting now...");
    }

    const existingUser = await getUser(args[0]);

    if(existingUser == null){
        throw new Error("Username doesn't exist. Exiting now...");
    }

    setUser(args[0]);
    console.log(`Login of ${args[0]} was successful`);
}

export async function registerUser(cmd: string, ...args: string[]){
    const name = args[0];

    if(name == null){
        throw new Error("Name required to register user. Exiting now...");
    }

    const existingUser = await getUser(name);

    if(existingUser != null){
        throw new Error("User already exists. Exiting now...");
    }

    const result = await createUser(name);

    setUser(name);
    console.log("User was created.");
    console.log(result);
}

export async function resetUsers(cmd: string, ...args: string[]){
    try{
        await clearUsers();
    }
    catch(e){
        if (e instanceof Error){
            console.log(e);
            exit(1);
        }
    }
    console.log("Users table was cleared.");
}

export async function getUsers(cmd: string, ...args: string[]){
    let users: any[] = [];

    try{
        users = await selectUsers();
    }
    catch(e){
        if (e instanceof Error){
            console.log(e);
            exit(1);
        }
    }

    const curretnUser = getCurrentUser();

    users.forEach(user => {
        if(user.name == curretnUser){
            console.log(`* ${user.name} (current)`);
        }
        else{
            console.log(`* ${user.name}`);
        }
    });
}


// -----------------
// Feeds
// -----------------

export async function addFeed(cmd: string, user: User, ...args: string[]){
    const name = args[0];
    const url = args[1];

    if(name == null || url == null){
        throw new Error("Invalid arguements provided.")
    }

    try{
        const feed = await createFeed(name, url, user.id);
        const feedFollow = await createFeedFollow(user.id, feed.id)

        console.log(`User ${user.name} followed "${feedFollow.feedName}"`);
    }
    catch(e){
        if(e instanceof Error){
            console.log(e);
            exit(1);
        }
    }
}

export async function getFeeds(cmd: string, ...args: string[]){
    try{
        const feeds = await selectFeeds();

        for (const feed of feeds){
            const user = await getUserFromUUID(feed.user_id);
            printFeed(feed, user);
        }
    }
    catch(e){
        if (e instanceof Error){
            console.log(e);
            exit(1);
        }
    }
}

export async function scrapeFeeds(){
    try{
        const feed = await getNextFeedToFetch();

        if(!feed){
            throw new Error("No feeds to scrape.");
        }

        const response = await feedFetch(feed.url)
        await markFeedFetched(feed.id);

        for(const items of response.channel.item){

            const newPost: NewPost = {title: items.title, url: items.link, description: items.description, publishedAt: new Date(items.pubDate), feed_id: feed.id};
            await createPost(newPost);
        }
    }
    catch(e){
        if (e instanceof Error){
            console.log(e);
            return;
        }
    }
}

// Feed Follows
    
export async function followCommand(cmd: string, user: User, ...args: string[]){
    const url = args[0];

    try{
        const feed = await getFeed(url);

        const feedFollow = await createFeedFollow(user.id, feed.id);

        console.log(`User ${user.name} followed "${feedFollow.feedName}"`);
    }
    catch(e){
        if (e instanceof Error){
            console.log(e);
            exit(1);
        }
    }
}

export async function followingCommand(cmd: string, user: User, ...args: string[]){
    try{
        const feeds = await getFeedFollowsForUser(user.id);

        for(const feed of feeds){
            console.log(`${feed.feedName}`);
        }
    }
    catch(e){
        if (e instanceof Error){
            console.log(e);
            exit(1);
        }
    }
}

export async function unfollowCommand(cmd: string, user: User, ...args: string[]){
    const feedURL = args[0];

    if(!feedURL){
        throw new Error("No feed provided.");
    }
    

    try{
        const feed = await getFeed(feedURL);
        await deleteFeedFollows(user.id, feed.id);
    }
    catch(e){
        if(e instanceof Error){
            console.log(e);
            exit(1);
        }
    }
}


// -----------------
// Posts
// -----------------

export async function  browseCommand(cmd: string, user: User, ...args: string[]){
    let limit = +args[0];

    if(!limit){
        limit = 2;
    }

    try{
        const posts = await getPostsForUser(user.id, limit)

        for(const post of posts){
            printPost(post);
        }
    }
    catch(e){
        if(e instanceof Error){
            console.log(e);
            return;
        }
    }
}


// -----------------
// General
// -----------------

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler{
    return async (cmdName: string, ...args: string[]): Promise<void> => {
        const name = readConfig().currentUserName

        if(!name){
            throw new Error("No logged in user");
        }

        const user = await getUser(name);

        if (!user) {
            throw new Error(`User ${name} not found`);
        }

        await handler(cmdName, user, ...args);
    }
}

export async function aggCommand(cmd: string, ...args: string[]){
    if(!args[0]){
        throw new Error(`No arguements provided.`);
    }

    if(args.length > 1){
        throw new Error ("More than one arguement provided.");
    }

    const time = args[0];
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = time.match(regex);

    if(match == null){
        throw new Error("Invalid arguement.");
    }

    let timeBetweenRequests = +match[1];

    switch(match[2]){
        case "s":
            timeBetweenRequests *= 1_000;
            break;
        case "m":
            timeBetweenRequests *= 60_000;
            break;
        case "h":
            timeBetweenRequests *= 3_600_000;
            break;
    }

    console.log(`Feed aggregator starting... Interval set to ${time}...`);

    scrapeFeeds().catch(handleError);

    const interval = setInterval(() => {
        scrapeFeeds().catch(handleError);
    }, timeBetweenRequests);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        })
    })
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler){
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]){
    if(!(cmdName in registry)){
        throw new Error("Command does not exist in registry.");
    }

    await registry[cmdName](cmdName, ...args);
}


// -----------------
// Helpers
// -----------------

export function printFeed(feed: Feed, user: User){

    console.log(`"${feed.name}"`);
    console.log(`"${feed.url}"`);
    console.log(`Created by: "${user.name}"`);
}

function getCurrentUser(){
    return readConfig().currentUserName;
}

function handleError(err: unknown) {
  console.error(
    `Error scraping feeds: ${err instanceof Error ? err.message : err}`,
  );
}

function printPost(post: NewPost){
    console.log(`Title: ${post.title}`);
    console.log(`URL: ${post.url}`);
    console.log(`Description: ${post.description}`);
    console.log(`Published: ${post.publishedAt}`);
}