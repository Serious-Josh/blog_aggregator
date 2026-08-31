import { readConfig, setUser } from "./config.js";
import { createUser, getUser, clearUsers, selectUsers } from "./lib/db/queries/users.js";
import { exit } from "node:process";
import { feedFetch } from "./rss.js";
import { createFeed } from "./lib/db/queries/feeds.js";
import { feeds, users } from "./lib/db/schema.js";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;
export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

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

    const curretnUser = readConfig().currentUserName;

    users.forEach(user => {
        if(user.name == curretnUser){
            console.log(`* ${user.name} (current)`);
        }
        else{
            console.log(`* ${user.name}`);
        }
    });
}

export async function addFeed(cmd: string, ...args: string[]){
    const name = args[0];
    const url = args[1];
    const currentUser = (await getUser(readConfig().currentUserName)).id;

    if(name == null || url == null){
        throw new Error("Invalid arguements provided.")
    }

    try{
        createFeed(name, url, currentUser);
    }
    catch(e){
        if(e instanceof Error){
            console.log(e);
            exit(1);
        }
    }
}

export async function aggCommand(cmd: string, ...args: string[]){
    const response = await feedFetch("https://www.wagslane.dev/index.xml")
    console.log(JSON.stringify(response, null, 2));
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



//----------
// Helpers
//----------

export function printFeed(feed: Feed, user: User){

    //actually format this later
    console.log(user);
    console.log(feed);
}