import { drizzle } from "drizzle-orm/libsql";

import { SERVER_ENV } from "../../env";

export const db = drizzle(SERVER_ENV.DB_FILE);
