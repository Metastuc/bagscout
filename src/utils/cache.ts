import { redis } from "#/modules/core/redis.ts";

import { toTime } from "./time";

const CACHE_TTL = toTime({
    unit: "days",
    value: 7,
    output: "seconds",
}) as number;

const TOKEN_KEY = (poolAddress: string) => `bagscout:token:${poolAddress}`;
const ALL_TOKENS_KEY = "bagscout:tokens:index";

export const cacheUtils = {
    async getToken(poolAddress: string) {
        const raw = await redis.get(TOKEN_KEY(poolAddress));
        return raw ? (JSON.parse(raw) as MergedBagsTokenWithPool) : null;
    },

    async setToken(token: MergedBagsTokenWithPool) {
        await redis.set(TOKEN_KEY(token.poolAddress as string), JSON.stringify({ ...token, lastFetched: Date.now() }), "EX", CACHE_TTL);
        await redis.sadd(ALL_TOKENS_KEY, token.poolAddress as string);
    },

    async setMultipleTokens(tokens: Array<MergedBagsTokenWithPool>) {
        const pipeline = redis.pipeline();
        for (const token of tokens) {
            pipeline.set(TOKEN_KEY(token.poolAddress as string), JSON.stringify({ ...token, lastFetched: Date.now() }), "EX", CACHE_TTL);
            pipeline.sadd(ALL_TOKENS_KEY, token.poolAddress as string);
        }
        await pipeline.exec();
    },

    async getAllTokens(): Promise<Array<MergedBagsTokenWithPool>> {
        const keys = await redis.smembers(ALL_TOKENS_KEY);
        if (keys.length === 0) return [];

        const values = await redis.mget(keys.map(TOKEN_KEY));
        return values.filter(Boolean).map((value) => JSON.parse(value as string) as MergedBagsTokenWithPool);
    },

    async updateTokenCache(poolAddress: string, geckoData: MergedBagsTokenWithPool["geckoData"]) {
        const existing = await this.getToken(poolAddress);
        if (!existing) {
            console.warn(`Attempted to update cache for non-existent token: ${poolAddress}`);
            return;
        }

        await this.setToken({ ...existing, geckoData });
    },
};
