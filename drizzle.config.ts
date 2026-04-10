import { defineConfig } from "drizzle-kit";

import { SERVER_ENV } from "#/env/server-env.ts";

export default defineConfig({
    dbCredentials: { url: SERVER_ENV.DB_URI },
    dialect: "postgresql",
    out: "./drizzle",
    schema: "./src/db/schema.ts",
});
