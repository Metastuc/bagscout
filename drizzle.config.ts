import { defineConfig } from "drizzle-kit";

import { SERVER_ENV } from "./env";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: SERVER_ENV.DB_FILE,
  },
});
