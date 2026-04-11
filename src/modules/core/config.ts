import { toTime } from "#/utils/time.ts";

export const REDIS_KEYS = {
    ALL_TOKENS_KEY: "bagscout:tokens:index",

    TICKER_TOKENS_KEY: "bagscout:ticker:top",

    TOKEN: {
        KEY: (poolAddress: string) => `bagscout:token:${poolAddress}`,
        TTL: toTime({ unit: "minutes", value: 30, output: "seconds" }) as number,
    },

    TOKEN_VOLUME_KEY: "bagscout:tokens:volume",
};
