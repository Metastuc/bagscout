import { sleep } from "#/utils/sleep.ts";
import { toTime } from "#/utils/time.ts";

export async function existingDataInRedisToPostgres(deps: AppDependencies, attempt = 1): Promise<void> {
    const [MAX_ATTEMPTS, RETRY_DELAY] = [5, toTime({ unit: "seconds", value: 10, output: "milliseconds" }) as number];

    try {
        const poolAddresses = await deps.redis.smembers("bagscout:tokens:index");

        if (poolAddresses.length === 0) {
            deps.logger.info({ msg: "Redis empty, nothing to migrate" });
            return;
        }

        const values = await deps.redis.mget(poolAddresses.map((addr) => `bagscout:token:${addr}`));
        const tokens = values.filter(Boolean).map((v) => JSON.parse(v as string) as MergedBagsTokenWithPool);

        await deps.tokensRepository.upsertTokens(tokens);
        deps.logger.info({ msg: `Migrated ${tokens.length} tokens from Redis to SQL` });
    } catch (error) {
        if (attempt >= MAX_ATTEMPTS) {
            deps.logger.error({
                msg: `Redis migration failed after ${MAX_ATTEMPTS} attempts, giving up`,
                data: { message: (error as Error).message },
            });
            return;
        }

        deps.logger.warn({
            msg: `Redis not ready, retrying migration in 10s (attempt ${attempt}/${MAX_ATTEMPTS})`,
            data: { message: (error as Error).message },
        });

        await sleep(RETRY_DELAY);
        await existingDataInRedisToPostgres(deps, attempt + 1);
    }
}
