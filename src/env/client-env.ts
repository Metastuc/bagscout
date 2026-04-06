import { z } from "zod";

export const CLIENT_ENV = z
    .object({
        VITE_PORT: z.string(),
        VITE_PRIVY_APP_ID: z.string(),
        VITE_PRIVY_CLIENT_ID: z.string(),
        VITE_SOLANA_RPC_URL: z.string(),
    })
    .parse(import.meta.env);
