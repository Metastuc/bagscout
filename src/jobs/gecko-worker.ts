import { Queue, Worker } from "bullmq";

import { redis } from "#/modules/core/redis.ts";
import { getGeckoPools } from "#/modules/services/gecko.ts";
import { toTime } from "#/utils/time.ts";

import { withDependencies } from "../modules";

export const geckoDataQueue = new Queue("gecko-data-refresh", {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: {
            age: toTime({ unit: "hours", value: 1, output: "seconds" }) as number,
            count: 100,
        },
        removeOnFail: {
            age: toTime({ unit: "days", value: 1, output: "seconds" }) as number,
            count: 500,
        },
    },
});

new Worker(
    "gecko-data-refresh",
    async function (job) {
        await withDependencies(async (deps) => {
            const logger = deps.logger.child({ module: "GECKO DATA REFRESH", eventId: job.id });
            logger.info({ msg: "Starting Gecko data refresh job", data: { jobId: job.id, repeatJobKey: job.repeatJobKey } });

            const { poolAddresses } = job.data as { poolAddresses: Array<string> };
            const pools = await getGeckoPools(poolAddresses, { ...deps, logger });
            if (!pools || pools.length === 0) return null;

            try {
                const poolsMap = new Map(pools?.map((pool) => [pool.attributes.address, pool]));
                for (const poolAddress of poolAddresses) {
                    const poolData = poolsMap.get(poolAddress) ?? null;
                    await deps.tokensService.updateToken(poolAddress, { data: poolData, fetchedAt: Date.now() });
                }
            } catch (error) {
                logger.error({ msg: "Error in Gecko data refresh job", data: { message: (error as Error).message, stack: (error as Error).stack } });
            }

            logger.info({
                msg: "Finished Gecko data refresh job",
                data: { jobId: job.id, repeatJobKey: job.repeatJobKey, updatedPools: pools.length },
            });
        });
    },
    {
        connection: redis,
        limiter: { max: 1, duration: toTime({ unit: "seconds", value: 15, output: "milliseconds" }) as number },
    },
);
