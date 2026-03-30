import { appLogger } from "#/utils/log.ts";
import { toTime } from "#/utils/time.ts";

import { bagsTokenQueue } from "./bags-worker";

export async function startJobs() {
    appLogger.info({ msg: "Starting background jobs" });

    await bagsTokenQueue.add("refresh", {}, { repeat: { every: toTime({ unit: "minutes", value: 5, output: "milliseconds" }) as number } });

    appLogger.info({ msg: "Background jobs started" });
}

startJobs().catch((error) => {
    appLogger.error({ msg: (error as Error).message, data: { stack: (error as Error).stack } });
    process.exit(1);
});
