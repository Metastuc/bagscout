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
        console.log("GECKO JOB START", {
            jobId: job.id,
            repeatJobKey: job.repeatJobKey,
            ts: Date.now(),
        });

        const { poolAddresses } = job.data as { poolAddresses: Array<string> };

        try {
            const pools = await withDependencies(async (deps) => await getGeckoPools(poolAddresses, deps));
            const poolsMap = new Map(pools?.map((pool) => [pool.attributes.address, pool]));

            await withDependencies(async (deps) => {
                for (const poolAddress of poolAddresses) {
                    const existing = await deps.cache.getToken(poolAddress);
                    const poolData = poolsMap.get(poolAddress) ?? null;

                    if (existing?.geckoData?.fetchedAt) {
                        const dataAge = Date.now() - existing.geckoData.fetchedAt;
                        const transactionsIn24H = existing.geckoData.data?.attributes?.transactions?.h24;
                        const totalTransactions = (transactionsIn24H?.sells ?? 0) + (transactionsIn24H?.buys ?? 0);
                        const staleDuration =
                            totalTransactions > 100
                                ? (toTime({
                                      unit: "minutes",
                                      value: 2,
                                      output: "milliseconds",
                                  }) as number)
                                : totalTransactions > 10
                                  ? (toTime({
                                        unit: "minutes",
                                        value: 15,
                                        output: "milliseconds",
                                    }) as number)
                                  : (toTime({
                                        unit: "minutes",
                                        value: 30,
                                        output: "milliseconds",
                                    }) as number);

                        if (dataAge < staleDuration) {
                            deps.logger.info({
                                msg: "Skipping Gecko API update for pool due to recent data",
                                data: { poolAddress },
                            });
                            continue;
                        }
                    }

                    await deps.cache.updateTokenCache(poolAddress, {
                        data: poolData,
                        fetchedAt: Date.now(),
                    });

                    deps.logger.info({
                        msg: "Updated Gecko data for pool",
                        data: { poolAddress, hasData: !!poolData },
                    });
                }
            });

            console.log("GECKO BATCH RESULT", {
                requested: poolAddresses.length,
                received: pools.length,
                sample: pools[0]?.attributes?.address,
            });
        } catch (error) {
            await withDependencies(async (deps) => {
                deps.logger.error({
                    msg: (error as Error).message,
                    data: { stack: (error as Error).stack },
                });
            });
            return null;
        }
    },
    {
        connection: redis,
        limiter: {
            max: 1,
            duration: toTime({
                unit: "seconds",
                value: 15,
                output: "milliseconds",
            }) as number,
        },
    },
);
