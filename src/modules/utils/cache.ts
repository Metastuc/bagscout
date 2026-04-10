import { redis } from "#/modules/core/redis.ts";
import { toTime } from "#/utils/time.ts";

import { withDependencies } from "..";

const CACHE_TTL = toTime({
    unit: "days",
    value: 7,
    output: "seconds",
}) as number;

const ALL_TOKENS_KEY = "bagscout:tokens:index";
const TICKER_TOKENS_KEY = "bagscout:ticker:top";
const TOKEN_KEY = (poolAddress: string) => `bagscout:token:${poolAddress}`;
const TOKEN_VOLUME_KEY = "bagscout:tokens:volume";

export const cacheUtils = {
    //

    async getAllTokens(): Promise<Array<MergedBagsTokenWithPool>> {
        try {
            const keys = await redis.smembers(ALL_TOKENS_KEY);
            if (keys.length === 0) return withDependencies(async (deps) => await deps.dbTokens.getAllTokens());

            const values = await redis.mget(keys.map(TOKEN_KEY));
            return values.filter(Boolean).map((value) => JSON.parse(value as string) as MergedBagsTokenWithPool);
        } catch {
            return withDependencies(async (deps) => await deps.dbTokens.getAllTokens());
        }
    },

    async getToken(poolAddress: string) {
        try {
            const raw = await redis.get(TOKEN_KEY(poolAddress));
            return raw
                ? (JSON.parse(raw) as MergedBagsTokenWithPool)
                : withDependencies(async (deps) => await deps.dbTokens.getTokenByPoolAddress(poolAddress));
        } catch {
            return withDependencies(async (deps) => await deps.dbTokens.getTokenByPoolAddress(poolAddress));
        }
    },

    async setToken(token: MergedBagsTokenWithPool) {
        await withDependencies(async (deps) => await deps.dbTokens.upsertTokens([token]));

        try {
            await redis.set(TOKEN_KEY(token.poolAddress as string), JSON.stringify({ ...token, lastFetched: Date.now() }), "EX", CACHE_TTL);
            await redis.sadd(ALL_TOKENS_KEY, token.poolAddress as string);
        } catch (error) {
            withDependencies(async (deps) =>
                deps.logger.error({
                    msg: "Failed to set token in Redis cache",
                    data: { error: (error as Error).message, stack: (error as Error).stack },
                }),
            );
        }
    },

    async setMultipleTokens(tokens: Array<MergedBagsTokenWithPool>) {
        await withDependencies(async (deps) => await deps.dbTokens.upsertTokens(tokens));

        try {
            const pipeline = redis.pipeline();
            for (const token of tokens) {
                pipeline.set(TOKEN_KEY(token.poolAddress as string), JSON.stringify({ ...token, lastFetched: Date.now() }), "EX", CACHE_TTL);
                pipeline.sadd(ALL_TOKENS_KEY, token.poolAddress as string);
            }
            await pipeline.exec();
        } catch (error) {
            withDependencies(async (deps) =>
                deps.logger.error({
                    msg: "Failed to set multiple tokens in Redis cache",
                    data: { error: (error as Error).message, stack: (error as Error).stack },
                }),
            );
        }
    },

    //

    async updateTokenCache(poolAddress: string, geckoData: MergedBagsTokenWithPool["geckoData"]) {
        const existing = await this.getToken(poolAddress);
        if (!existing) {
            console.warn(`Attempted to update cache for non-existent token: ${poolAddress}`);
            return;
        }

        await withDependencies(async (deps) => await deps.dbTokens.updateGeckoData(poolAddress, geckoData));

        try {
            const volumeIn24H = Number(geckoData?.data?.attributes?.volume_usd?.h24 ?? 0);
            await this.setToken({ ...existing, geckoData });

            if (volumeIn24H > 0) await redis.zadd(TOKEN_VOLUME_KEY, volumeIn24H, poolAddress);
            await this.refreshTickerTokens();
        } catch (error) {
            withDependencies(async (deps) =>
                deps.logger.error({
                    msg: "Failed to update token cache",
                    data: { error: (error as Error).message, stack: (error as Error).stack },
                }),
            );
        }
    },

    //

    async getTopTokensByVolume(limit: number): Promise<Array<MergedBagsTokenWithPool>> {
        try {
            const topPoolAddresses = await redis.zrevrange(TOKEN_VOLUME_KEY, 0, limit - 1);
            if (topPoolAddresses.length === 0) return withDependencies(async (deps) => await deps.dbTokens.getTopTokensByVolume(limit));

            const pipeline = redis.pipeline();
            for (const poolAddress of topPoolAddresses) {
                pipeline.get(TOKEN_KEY(poolAddress));
            }

            const results = (await pipeline.exec()) ?? [];
            return results
                .map(([_error, value]) => (value ? (JSON.parse(value as string) as MergedBagsTokenWithPool) : null))
                .filter((token): token is MergedBagsTokenWithPool => token !== null);
        } catch {
            return withDependencies(async (deps) => await deps.dbTokens.getTopTokensByVolume(limit));
        }
    },

    async getTickerTokens(): Promise<Array<MergedBagsTokenWithPool>> {
        try {
            const raw = await redis.get(TICKER_TOKENS_KEY);
            return raw ? (JSON.parse(raw) as Array<MergedBagsTokenWithPool>) : [];
        } catch {
            return this.getTopTokensByVolume(20);
        }
    },

    async refreshTickerTokens() {
        try {
            const topTokens = await this.getTopTokensByVolume(20);

            if (topTokens.length > 0)
                await redis.set(
                    TICKER_TOKENS_KEY,
                    JSON.stringify(topTokens),
                    "EX",
                    toTime({
                        unit: "minutes",
                        value: 10,
                        output: "seconds",
                    }) as number,
                );
        } catch (error) {
            withDependencies(async (deps) =>
                deps.logger.error({
                    msg: "Failed to refresh ticker tokens in Redis cache",
                    data: { error: (error as Error).message, stack: (error as Error).stack },
                }),
            );
        }
    },
};
