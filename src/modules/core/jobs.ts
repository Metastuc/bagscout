import { Queue, Worker } from "bullmq";

import { toTime } from "#/utils/time.ts";

import { withDependencies } from "..";
import { getPoolsFromBags, getTokensFromBags } from "../services/bags";
import { getGeckoPool } from "../services/gecko";
import { mergeBagsTokenWithPool } from "../utils/merge-bags-pool";
import { redis } from "./redis";

// Queues for refreshing bags tokens and gecko data, with appropriate retry and cleanup strategies
const bagsTokenQueue = new Queue("bags-tokens-refresh", {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: { age: toTime({ unit: "hours", value: 1, output: "seconds" }) as number, count: 100 },
        removeOnFail: { age: toTime({ unit: "days", value: 1, output: "seconds" }) as number, count: 500 },
    },
});

const geckoDataQueue = new Queue("gecko-data-refresh", {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: { age: toTime({ unit: "hours", value: 1, output: "seconds" }) as number, count: 100 },
        removeOnFail: { age: toTime({ unit: "days", value: 1, output: "seconds" }) as number, count: 500 },
    },
});

// Worker to refresh bags tokens and their associated gecko data
new Worker(
    "bags-tokens-refresh",
    async function () {
        const [tokens, pools] = await Promise.all([
            withDependencies((deps) => getTokensFromBags(deps)),
            withDependencies((deps) => getPoolsFromBags(deps)),
        ]);

        const merged = mergeBagsTokenWithPool(tokens ?? [], pools ?? []);

        await withDependencies(async (deps) => {
            const cache = deps.cache.readCache();

            const mergeExistingCache = merged.map((token) => {
                const cachedToken = cache?.tokens?.find((t) => t.tokenMint === token.tokenMint);
                return cachedToken?.geckoData ? { ...token, geckoData: cachedToken.geckoData } : token;
            });

            deps.cache.writeCache(mergeExistingCache);
        });

        for (const token of merged) {
            if (!token.poolAddress) continue;
            await geckoDataQueue.add("refresh-gecko-data", { poolAddress: token.poolAddress }, { jobId: token.poolAddress });
        }

        return { count: merged.length };
    },
    { connection: redis },
);

new Worker(
    "gecko-data-refresh",
    async function (job) {
        const { poolAddress } = job.data;

        try {
            const isDataFresh = await withDependencies(async (deps) => {
                const cache = deps.cache.readCache();
                const cachedToken = cache?.tokens?.find((t) => t.poolAddress === poolAddress);
                if (!cachedToken?.geckoData?.fetchedAt) return false;

                const dataAge = Date.now() - cachedToken.geckoData.fetchedAt;
                return dataAge < (toTime({ unit: "hours", value: 1 }) as number); // Only fetch if data is older than 1 hour
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
    { connection: redis, limiter: { max: 25, duration: toTime({ unit: "seconds", value: 60 }) as number } },
);

export async function startBagsTokensRefreshJob() {
    await bagsTokenQueue.add(
        "refresh",
        {},
        {
            repeat: { every: toTime({ unit: "minutes", value: 5, output: "milliseconds" }) as number },
        },
    );
}
