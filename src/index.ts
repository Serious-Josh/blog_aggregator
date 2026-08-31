import {addFeed, aggCommand, CommandsRegistry, getUsers, handlerLogin, registerUser, resetUsers, runCommand} from "./command.js"
import { exit } from "node:process";

async function main(){
    const registry: CommandsRegistry = {"login": handlerLogin, "register": registerUser, "reset": resetUsers, "users": getUsers, "agg": aggCommand, "addfeed": addFeed};
    const args: string[] = process.argv.slice(2);

    if(args[0] == null){
        console.log("No arguements provided. Exiting now...")
        exit(1);
    }

    const cmdName = args[0];
    const cmdArgs = args.slice(1);

    try{
        await runCommand(registry, cmdName, ...cmdArgs);
    }
    catch(error){
        if(error instanceof Error){
            console.log(error.message);
            exit(1);
        }
    }


    process.exit(0);
}

main();