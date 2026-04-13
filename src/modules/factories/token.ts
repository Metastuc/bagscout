import { REDIS_KEYS } from "../core/config";

export function createTokenService(deps: CoreDependencies & Repositories) {
    return {
        /**
         * Retrieves all tokens from the Redis cache or database.
         * If the Redis cache is empty, it falls back to retrieving all tokens
         * from the database.
         *
         * @returns {Promise<Array<MergedBagsTokenWithPool>>} A promise that resolves
         * with an array of MergedBagsTokenWithPool objects.
         */
        async getAllTokens() {
            try {
                const keys = await deps.redis.smembers(REDIS_KEYS.ALL_TOKENS_KEY);
                if (keys.length === 0) return await deps.tokensRepository.getAllTokens();

                const values = await deps.redis.mget(keys.map(REDIS_KEYS.TOKEN.KEY));
                const tokens = values.filter(Boolean).map((value) => JSON.parse(value as string) as MergedBagsTokenWithPool);

                if (tokens.length === 0) return await deps.tokensRepository.getAllTokens();
                return tokens;
            } catch {
                return await deps.tokensRepository.getAllTokens();
            }
        },

        /**
         * Retrieves a single token from the Redis cache or database.
         * If the token does not exist in the cache, it falls back to retrieving the token
         * from the database.
         * If the token does not exist in the database, it returns null.
         * @param {string} poolAddress The pool address of the token to retrieve.
         * @returns {Promise<MergedBagsTokenWithPool | null>} A promise that resolves
         * with the retrieved token or null if it does not exist.
         */
        async getToken(poolAddress: string) {
            try {
                const raw = await deps.redis.get(REDIS_KEYS.TOKEN.KEY(poolAddress));
                return raw ? (JSON.parse(raw) as MergedBagsTokenWithPool) : await deps.tokensRepository.getTokenByPoolAddress(poolAddress);
            } catch {
                return await deps.tokensRepository.getTokenByPoolAddress(poolAddress);
            }
        },

        /**
         * Sets a single token in the Redis cache.
         * Upserts the token in the database before setting it in the cache.
         * If the token does not exist in the cache, it is added with the current timestamp.
         * If the token does exist, its last fetched timestamp is updated.
         * @param {MergedBagsTokenWithPool} token The token to set in the cache.
         * @returns {Promise<void>} A promise that resolves when the token has been set in the cache.
         */
        async setToken(token: MergedBagsTokenWithPool) {
            await deps.tokensRepository.upsertTokens([token]);

            try {
                await deps.redis.set(
                    REDIS_KEYS.TOKEN.KEY(token.poolAddress as string),
                    JSON.stringify({ ...token, lastFetched: Date.now() }),
                    "EX",
                    REDIS_KEYS.TOKEN.TTL,
                );
                await deps.redis.sadd(REDIS_KEYS.ALL_TOKENS_KEY, token.poolAddress as string);
                await deps.redis.expire(REDIS_KEYS.TOKEN.KEY(token.poolAddress as string), REDIS_KEYS.TOKEN.TTL);
            } catch (error) {
                deps.logger.error({
                    msg: "Failed to set token in Redis cache",
                    data: { error: (error as Error).message, stack: (error as Error).stack },
                });
            }
        },

        /**
         * Sets multiple tokens in the Redis cache.
         * Upserts the tokens in the database before setting them in the cache.
         * If the tokens do not exist in the cache, they are added with the current timestamp.
         * If the tokens do exist, their last fetched timestamp is updated.
         * @param {Array<MergedBagsTokenWithPool>} tokens The tokens to set in the cache.
         * @returns {Promise<void>} A promise that resolves when the tokens have been set in the cache.
         */
        async setMultipleTokens(tokens: Array<MergedBagsTokenWithPool>) {
            await deps.tokensRepository.upsertTokens(tokens);

            try {
                const pipeline = deps.redis.pipeline();
                for (const token of tokens) {
                    pipeline.set(
                        REDIS_KEYS.TOKEN.KEY(token.poolAddress as string),
                        JSON.stringify({ ...token, lastFetched: Date.now() }),
                        "EX",
                        REDIS_KEYS.TOKEN.TTL,
                    );
                    pipeline.sadd(REDIS_KEYS.ALL_TOKENS_KEY, token.poolAddress as string);
                }
                await pipeline.exec();
            } catch (error) {
                deps.logger.error({
                    msg: "Failed to set multiple tokens in Redis cache",
                    data: { error: (error as Error).message, stack: (error as Error).stack },
                });
            }
        },

        /**
         * Updates the cache for a given token by pool address.
         * If the token does not exist in the cache, a warning is logged and nothing is done.
         * If the token does exist, the cache is updated with the new gecko data and the token is re-added to the cache with the new data.
         * If the token has a non-zero volume in 24 hours, it is also re-added to the sorted set of tokens by volume.
         * Finally, the ticker tokens are refreshed in the cache.
         * @param {string} poolAddress The pool address of the token to update.
         * @param {MergedBagsTokenWithPool["geckoData"]} geckoData The new gecko data to update the token with.
         */
        async updateToken(poolAddress: string, geckoData: MergedBagsTokenWithPool["geckoData"]) {
            const existing = await this.getToken(poolAddress);
            if (!existing) {
                deps.logger.warn({
                    msg: "Attempted to update cache for non-existent token",
                    data: { poolAddress },
                });
                return;
            }

            await deps.tokensRepository.updateGeckoData(poolAddress, geckoData);

            try {
                const volumeIn24H = Number(geckoData?.data?.attributes?.volume_usd?.h24 ?? 0);
                await this.setToken({ ...existing, geckoData });

                if (volumeIn24H > 0) await deps.redis.zadd(REDIS_KEYS.TOKEN_VOLUME_KEY, volumeIn24H, poolAddress);
            } catch (error) {
                deps.logger.error({
                    msg: "Failed to update token cache",
                    data: { error: (error as Error).message, stack: (error as Error).stack },
                });
            }
        },

        /**
         * Retrieves the top tokens by volume from the Redis cache or database.
         * If the Redis cache is empty, it falls back to retrieving the top tokens
         * by volume from the database.
         *
         * @param {number} limit The number of tokens to retrieve.
         * @returns {Promise<Array<MergedBagsTokenWithPool>>} A promise that resolves
         * with an array of MergedBagsTokenWithPool objects.
         */
        async getTopTokensByVolume(limit: number): Promise<Array<MergedBagsTokenWithPool>> {
            try {
                const topPoolAddresses = await deps.redis.zrevrange(REDIS_KEYS.TOKEN_VOLUME_KEY, 0, limit - 1);
                if (topPoolAddresses.length === 0) return await deps.tokensRepository.getTopTokensByVolume(limit);

                const pipeline = deps.redis.pipeline();
                for (const poolAddress of topPoolAddresses) {
                    pipeline.get(REDIS_KEYS.TOKEN.KEY(poolAddress));
                }

                const results = (await pipeline.exec()) ?? [];
                return results
                    .map(([_error, value]) => (value ? (JSON.parse(value as string) as MergedBagsTokenWithPool) : null))
                    .filter((token): token is MergedBagsTokenWithPool => token !== null);
            } catch {
                return await deps.tokensRepository.getTopTokensByVolume(limit);
            }
        },
    };
}
