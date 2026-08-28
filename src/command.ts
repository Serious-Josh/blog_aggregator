import { get } from "node:http";
import { setUser } from "./config.js";
import { createUser, getUser } from "./lib/db/queries/users.js";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

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

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler){
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]){
    if(!(cmdName in registry)){
        throw new Error("Command does not exist in registry.");
    }

    await registry[cmdName](cmdName, ...args);
}