import { REDIS_KEYS } from "../core/config";

export function createTokenService(deps: CoreDependencies & Repositories) {
    return {
        /**
         * Retrieves a single token from the Redis cache or database.
         * If the Redis cache contains the token, it will be returned.
         * If the Redis cache does not contain the token, it will fall back
         * to retrieving the token from the database.
         * @param {string} poolAddress The pool address to search for.
         * @returns {Promise<MergedBagsTokenWithPool | null>} A promise that resolves
         * with the retrieved token or null if it does not exist.
         */
        async getToken(poolAddress: string) {
            try {
                const raw = await deps.redis.get(REDIS_KEYS.TOKEN.KEY(poolAddress));
                return raw ? (JSON.parse(raw) as MergedBagsTokenWithPool) : await deps.tokensRepository.getToken({ poolAddress });
            } catch {
                return await deps.tokensRepository.getToken({ poolAddress });
            }
        },

        /**
         * Updates a single token in the Redis cache with its Gecko data.
         * Updates the token in the database before setting it in the cache
         * If the token does not exist in the cache, it is added with the current timestamp
         * If the token does exist, its last fetched timestamp is updated
         * @param {string} poolAddress The pool address of the token to update
         * @param {MergedBagsTokenWithPool["geckoData"]} geckoData The Gecko data of the token to update
         * @returns {Promise<void>} A promise that resolves when the token has been updated in the cache
         */
        async updateToken(poolAddress: string, geckoData: MergedBagsTokenWithPool["geckoData"]) {
            await deps.tokensRepository.updateGeckoData(poolAddress, geckoData);

            try {
                const existingToken = await this.getToken(poolAddress);
                if (!existingToken) return;

                await deps.redis.set(REDIS_KEYS.TOKEN.KEY(poolAddress as string), JSON.stringify(existingToken), "EX", REDIS_KEYS.TOKEN.TTL);
                const volumeIn24H = Number(geckoData?.data?.attributes?.volume_usd?.h24 ?? 0);
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
