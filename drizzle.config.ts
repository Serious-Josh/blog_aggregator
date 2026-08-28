import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "src/lib/schema.ts",
    out: "src/lib/db/",
    dialect: "postgresql",
    dbCredentials: {
        url: "postgres://postgres:postgres@localhost:5432/gator"
    },
});