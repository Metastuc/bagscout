import { appLogger } from "#/utils/log.ts";
import { toTime } from "#/utils/time.ts";

import { withDependencies } from "../modules";
import { bagsTokenQueue } from "./bags";
import { refreshTokenQueue } from "./refresh";

let jobsStarted = false;

export async function startJobs() {
    if (jobsStarted) return;
    jobsStarted = true;

    await withDependencies(async function (deps) {
        const logger = deps.logger.child({ module: "JOBS STARTUP" });
        logger.info({ msg: "Starting background jobs" });

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

        logger.info({ msg: "Background jobs started" });
    });
}

startJobs().catch((error) => {
    appLogger.error({ msg: (error as Error).message, data: { stack: (error as Error).stack } });
    process.exit(1);
});
