import { Queue, Worker } from "bullmq";

import { redis } from "#/modules/core/redis.ts";
import { classifyToken } from "#/modules/utils/classify-tokens.ts";
import { chunkArray } from "#/utils/chunk.ts";
import { generateLogId } from "#/utils/log.ts";
import { toTime } from "#/utils/time.ts";

import { withDependencies } from "../modules";
import { geckoDataQueue } from "./gecko";

export const refreshTokenQueue = new Queue("db-tokens-refresh", {
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

const BATCH_SIZE = 25;

new Worker(
    "db-tokens-refresh",
    async function (job) {
        await withDependencies(async (deps) => {
            const logger = deps.logger.child({ module: "DB TOKENS REFRESH", eventId: `${generateLogId()}-${job.id}` });
            logger.info({ msg: "Starting DB tokens refresh job", data: { jobId: job.id, repeatJobKey: job.repeatJobKey } });

            const geckoJobCount = await geckoDataQueue.getJobCounts("active", "waiting", "delayed");
            const totalPending = geckoJobCount.active + geckoJobCount.waiting + geckoJobCount.delayed;
            if (totalPending > 0) {
                logger.warn({ msg: "Gecko queue busy, skipping rotation", data: { pendingGeckoJobs: totalPending } });
                return;
            }

            const sortedTokens = (await deps.tokensRepository.getAllTokens())
                .filter((token) => token.poolAddress)
                .filter((token) => {
                    if (classifyToken(token) !== "cold") return true;
                    return token.geckoData?.fetchedAt
                        ? Date.now() - token.geckoData.fetchedAt > (toTime({ unit: "hours", value: 1, output: "milliseconds" }) as number)
                        : true;
                })
                .sort((a, b) => {
                    const tierOrder = { hot: 0, warm: 1, cold: 2 };
                    return tierOrder[classifyToken(a)] - tierOrder[classifyToken(b)];
                });

            const poolBatches = chunkArray(
                sortedTokens.map((token) => token.poolAddress as string),
                BATCH_SIZE,
            );

            for (const batch of poolBatches) {
                await geckoDataQueue.add("refresh-gecko-data-batch", { poolAddresses: batch });
            }

            logger.info({
                msg: "Finished DB tokens refresh job",
                data: {
                    total: sortedTokens.length,
                    batches: poolBatches.length,
                    hot: sortedTokens.filter((t) => classifyToken(t) === "hot").length,
                    warm: sortedTokens.filter((t) => classifyToken(t) === "warm").length,
                    cold: sortedTokens.filter((t) => classifyToken(t) === "cold").length,
                    estimatedMinutes: Math.round((poolBatches.length * 15) / 60),
                },
            });
        });
    },
    { connection: redis },
);
