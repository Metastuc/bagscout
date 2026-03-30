import { Queue, Worker } from "bullmq";

import { redis } from "#/modules/core/redis.ts";
import { getGeckoPool } from "#/modules/services/gecko.ts";
import { toTime } from "#/utils/time.ts";

import { withDependencies } from "../modules";

export const geckoDataQueue = new Queue("gecko-data-refresh", {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: { age: toTime({ unit: "hours", value: 1, output: "seconds" }) as number, count: 100 },
        removeOnFail: { age: toTime({ unit: "days", value: 1, output: "seconds" }) as number, count: 500 },
    },
});

new Worker(
    "gecko-data-refresh",
    async function (job) {
        console.log("GECKO JOB START", {
            jobId: job.id,
            repeatJobKey: job.repeatJobKey,
            ts: Date.now(),
        });

        const { poolAddress } = job.data;

        try {
            const isDataFresh = await withDependencies(async (deps) => {
                const cache = deps.cache.readCache();
                const cachedToken = cache?.tokens?.find((t) => t.poolAddress === poolAddress);
                if (!cachedToken?.geckoData?.fetchedAt) return false;

                const dataAge = Date.now() - cachedToken.geckoData.fetchedAt;
                return dataAge < (toTime({ unit: "hours", value: 1, output: "milliseconds" }) as number); // Only fetch if data is older than 1 hour
            });

            if (isDataFresh) return null;

            const geckoDataWithTimestamp = {
                data: (await withDependencies((deps) => getGeckoPool(poolAddress, deps))) as GeckoPoolData,
                fetchedAt: Date.now(),
            };

            await withDependencies(async (deps) => {
                deps.cache.updateTokenCache(poolAddress, geckoDataWithTimestamp);
            });

            return geckoDataWithTimestamp;
        } catch (error) {
            await withDependencies(async (deps) => {
                deps.logger.error({ msg: (error as Error).message, data: { stack: (error as Error).stack } });
            });
            return null;
        }
    },
    { connection: redis, limiter: { max: 4, duration: toTime({ unit: "minutes", value: 1, output: "milliseconds" }) as number } },
);
