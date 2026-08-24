import fs from 'fs';
import os from 'os';
import path from "path";

export type Config = {
    dbUrl: string;
    currentUserName: string;
}

export function setUser(curent_user_name: string): void{
    const cfg = {dbUrl: "postgres://example", currentUserName: curent_user_name};
    writeConfig(cfg);
}

export function readConfig(): Config{
   const data = fs.readFileSync(getConfigFilePath(),"utf-8");
   const rawConfig = JSON.parse(data);


    return validateConfig(rawConfig);
}


function getConfigFilePath(): string{
    if(fs.existsSync(path.join(os.homedir(), ".gatorconfig.json"))){
        return path.join(os.homedir(), ".gatorconfig.json");
    }
    else{
        return "";
    }
}

function validateConfig(rawConfig: unknown): Config {
    if (typeof rawConfig !== "object" || rawConfig === null) {
        throw new Error("Invalid config");
    }

    const data = rawConfig as Record<string, unknown>;

    if (
        typeof data.db_url !== "string" ||
        typeof data.current_user_name !== "string"
    ) {
        throw new Error("Invalid config");
    }

    return {
        dbUrl: data.db_url,
        currentUserName: data.current_user_name
    };
}

function writeConfig(cfg: Config): void{
    const rawConfig = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName
    };

    fs.writeFileSync(getConfigFilePath(), JSON.stringify(rawConfig));
}