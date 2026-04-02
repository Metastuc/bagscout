import { Queue, Worker } from "bullmq";

import { redis } from "#/modules/core/redis.ts";
import {
  getPoolsFromBags,
  getTokensFromBags,
} from "#/modules/services/bags.ts";
import { mergeBagsTokenWithPool } from "#/modules/utils/merge-bags-pool.ts";
import { toTime } from "#/utils/time.ts";

import { withDependencies } from "../modules";
import { geckoDataQueue } from "./gecko-worker";

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
    console.log("BAGS JOB START", {
      jobId: job.id,
      repeatJobKey: job.repeatJobKey,
      ts: Date.now(),
    });

    const existingTokens = await withDependencies((deps) =>
      deps.cache.getAllTokens(),
    );
    const existingMap = new Map(
      existingTokens?.map((token) => [token.poolAddress, token]),
    );

    const [tokens, pools] = await Promise.all([
      withDependencies((deps) => getTokensFromBags(deps)),
      withDependencies((deps) => getPoolsFromBags(deps)),
    ]);

    const merged = mergeBagsTokenWithPool(tokens ?? [], pools ?? []);

    await withDependencies(async (deps) => {
      const mergeWithCache = merged.map(function (token) {
        const cached = existingMap.get(token.poolAddress as string);
        return cached?.geckoData
          ? { ...token, geckoData: cached.geckoData }
          : token;
      });

      await deps.cache.setMultipleTokens(mergeWithCache);
    });

    for (const token of merged) {
      if (!token.poolAddress) continue;
      await geckoDataQueue.add("refresh-gecko-data", {
        poolAddress: token.poolAddress,
      });
    }

    return { count: merged.length };
  },
  { connection: redis },
);
