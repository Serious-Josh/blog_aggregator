import {CommandsRegistry, handlerLogin, runCommand} from "./command.js"
import { exit } from "node:process";

function main(){
    const registry: CommandsRegistry = {"login": handlerLogin};
    const args: string[] = process.argv.slice(2);

    if(args[0] == null){
        console.log("No arguements provided. Exiting now...")
        exit(1);
    }

    for(let i = 0; i < args.length; i += 2){
        const cmdName = args[i];
        const cmdArgs = args[i + 1];

        try{
            runCommand(registry, cmdName, cmdArgs);
        }
        catch(error){
            if(error instanceof Error){
                console.log(error.message);
                exit(1);
            }
        }
    }
}

main();