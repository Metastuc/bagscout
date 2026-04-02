import { appLogger } from "#/utils/log.ts";
import { toTime } from "#/utils/time.ts";

import { bagsTokenQueue } from "./bags-worker";

let jobsStarted = false;

export async function startJobs() {
  if (jobsStarted) return;
  jobsStarted = true;

  appLogger.info({ msg: "Starting background jobs" });

  await bagsTokenQueue.add("refresh", {}, { jobId: "bags-initial-feed" });
  await bagsTokenQueue.add(
    "refresh",
    {},
    {
      jobId: "bags-refresh-feed",
      repeat: {
        every: toTime({
          unit: "minutes",
          value: 5,
          output: "milliseconds",
        }) as number,
      },
    },
  );

  appLogger.info({ msg: "Background jobs started" });
}

startJobs().catch((error) => {
  appLogger.error({
    msg: (error as Error).message,
    data: { stack: (error as Error).stack },
  });
  process.exit(1);
});
