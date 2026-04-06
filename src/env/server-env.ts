import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env.local", quiet: true });

export const SERVER_ENV = z
    .object({
        BAGS_API_KEY: z.string(),
        DB_FILE: z.string(),
        DB_NAME: z.string(),
        PRIVY_APP_ID: z.string(),
        PRIVY_APP_KEY: z.string().transform((value) => value.replace(/\\n/g, "\n")),
        PRIVY_APP_SECRET: z.string(),
        REDIS_URL: z.string(),
    })
    .parse(process.env);
