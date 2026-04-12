import { chunkArray } from "@bagsfm/bags-sdk";
import { Queue, Worker } from "bullmq";

import { redis } from "#/modules/core/redis.ts";
import { classifyToken, groupByTier } from "#/modules/utils/classify-tokens.ts";
import { toTime } from "#/utils/time.ts";

import { withDependencies } from "../modules";
import { geckoDataQueue } from "./gecko-worker";

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

const CURSORS = {
    hot: "cursor:hot",
    warm: "cursor:warm",
    cold: "cursor:cold",
};

new Worker(
    "db-tokens-refresh",
    async function (job) {
        console.log("DB TOKENS REFRESH JOB START", {
            jobId: job.id,
            repeatJobKey: job.repeatJobKey,
            ts: Date.now(),
        });

        await withDependencies(async (deps) => {
            const tokens = await deps.tokensRepository.getAllTokens();
            tokens.sort((a, b) => (a.poolAddress ?? "").localeCompare(b.poolAddress ?? ""));

            const [hot, warm, cold] = [[], [], []] as Array<MergedBagsTokenWithPool[]>;

            for (const token of tokens) {
                if (!token.poolAddress) continue;
                const tier = classifyToken(token);

                if (tier === "hot") hot.push(token);
                else if (tier === "warm") warm.push(token);
                else cold.push(token);
            }

            const selected = [
                ...(await groupByTier({ key: CURSORS.hot, list: hot, counter: BATCH_SIZE * 2, deps })),
                ...(await groupByTier({ key: CURSORS.warm, list: warm, counter: BATCH_SIZE * 1, deps })),
                ...(await groupByTier({ key: CURSORS.cold, list: cold, counter: BATCH_SIZE * 1, deps })),
            ];

            const poolBatches = chunkArray(selected, BATCH_SIZE);

            for (const batch of poolBatches) {
                await geckoDataQueue.add("refresh-gecko-data-batch", {
                    poolAddresses: batch,
                });
            }

            console.log("DB TOKENS REFRESH JOB END", {
                hot: hot.length,
                warm: warm.length,
                cold: cold.length,
                selected: selected.length,
            });
        });
    },
    { connection: redis },
);
