import { setUser } from "./config.js";


export type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = Record<string, CommandHandler>;

export function handlerLogin(cmdName: string, ...args: string[]){
    if(args[0] == null){
        throw new Error("Username required for login. Exiting now...");
    }

    setUser(args[0]);
    console.log(`Login of ${args[0]} was successful`);
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler){
    registry[cmdName] = handler;
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]){
    if(!(cmdName in registry)){
        throw new Error("Command does not exist in registry.");
    }

    registry[cmdName](cmdName, ...args);
}