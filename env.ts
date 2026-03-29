import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });

export const SERVER_ENV = z
    .object({
        DB_NAME: z.string(),
        DB_FILE: z.string(),
        BAGS_API_KEY: z.string(),
    })
    .parse(process.env);

export const CLIENT_ENV = z
    .object({
        VITE_PORT: z.string(),
    })
    .parse(import.meta.env);
