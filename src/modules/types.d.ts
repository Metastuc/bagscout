import { tokensRepository } from "#/db/repository.ts";
import type { appLogger } from "#/utils/log.ts";

import { db } from "../db";
import { redis } from "./core/redis";
import { cacheUtils } from "./utils/cache";

interface ForeignDependencies {
    db: typeof db;
    redis: typeof redis;
}

interface LocalDependencies {
    cache: typeof cacheUtils;
    tokensRepository: typeof tokensRepository;
    logger: typeof appLogger;
}

declare global {
    type AppDependencies = LocalDependencies & ForeignDependencies;
}
export {};
