import { tokensRepository } from "#/db/repository.ts";
import { appLogger } from "#/utils/log.ts";

import { db } from "../db";
import { redis } from "./core/redis";
import { cacheUtils } from "./utils/cache";

const appDependencies: AppDependencies = {
    cache: cacheUtils,
    db: db,
    logger: appLogger,
    redis: redis,
    tokensRepository: tokensRepository,
};

export const withDependencies = async <T>(fn: (dependencies: AppDependencies) => Promise<T>): Promise<T> => fn(appDependencies);
