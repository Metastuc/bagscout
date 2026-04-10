import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { SERVER_ENV } from "#/env/server-env.ts";

export const db = drizzle({ client: postgres(SERVER_ENV.DB_URI, { prepare: false }) });
