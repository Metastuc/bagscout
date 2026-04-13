import { existingDataInRedisToPostgres } from "#/script/redis-to-sql.ts";
import { appLogger } from "#/utils/log.ts";
import { toTime } from "#/utils/time.ts";

import { withDependencies } from "../modules";
import { bagsTokenQueue } from "./bags-worker";
import { refreshTokenQueue } from "./refresh";

let jobsStarted = false;

export async function startJobs() {
    if (jobsStarted) return;
    jobsStarted = true;

    void withDependencies(async function (deps) {
        deps.logger.info({ msg: "Starting background jobs" });
        deps.logger.info({ msg: "Running startup events" });
        void existingDataInRedisToPostgres(deps).catch((error) => {
            deps.logger.error({
                msg: "Error during Redis to Postgres migration",
                data: { message: (error as Error).message, stack: (error as Error).stack },
            });
        });
    });

    await bagsTokenQueue.add("refresh", {}, { jobId: "bags-initial-feed" });
    await bagsTokenQueue.add(
        "refresh",
        {},
        {
            jobId: "bags-refresh-feed",
            repeat: { every: toTime({ unit: "minutes", value: 5, output: "milliseconds" }) as number },
        },
    );

    await refreshTokenQueue.add(
        "refresh",
        {},
        {
            jobId: "refresh-database-tokens",
            repeat: { every: toTime({ unit: "minutes", value: 10, output: "milliseconds" }) as number },
        },
    );

    appLogger.info({ msg: "Background jobs started" });
}

startJobs().catch((error) => {
    appLogger.error({ msg: (error as Error).message, data: { stack: (error as Error).stack } });
    process.exit(1);
});
