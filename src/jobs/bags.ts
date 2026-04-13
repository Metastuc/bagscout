import { Queue, Worker } from "bullmq";

import { redis } from "#/modules/core/redis.ts";
import { getPoolsFromBags, getTokensFromBags } from "#/modules/services/bags.ts";
import { mergeBagsTokenWithPool } from "#/modules/utils/merge-bags-pool.ts";
import { generateLogId } from "#/utils/log.ts";
import { toTime } from "#/utils/time.ts";

import { withDependencies } from "../modules";

export const bagsTokenQueue = new Queue("bags-tokens-refresh", {
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
    "bags-tokens-refresh",
    async function (job) {
        await withDependencies(async (deps) => {
            const logger = deps.logger.child({ module: "BAGS TOKENS REFRESH", eventId: `${generateLogId()}-${job.id}` });
            logger.info({ msg: "Starting bags tokens refresh job", data: { jobId: job.id, repeatJobKey: job.repeatJobKey } });

            const [tokens, pools] = await Promise.all([getTokensFromBags({ ...deps, logger }), getPoolsFromBags({ ...deps, logger })]);
            const merged = mergeBagsTokenWithPool(tokens ?? [], pools ?? []);
            await deps.tokensRepository.upsertTokens(merged);

            logger.info({
                msg: "Finished bags tokens refresh job",
                data: { jobId: job.id, repeatJobKey: job.repeatJobKey, mergedCount: merged.length },
            });
        });
    },
    { connection: redis },
);
