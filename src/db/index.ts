import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { SERVER_ENV } from "#/env/server-env.ts";

const url = SERVER_ENV.DB_URI;
console.log("Connecting to:", url.replace(/:([^@]+)@/, ":***@"));

export const db = drizzle({ client: postgres(SERVER_ENV.DB_URI, { prepare: false }) });
