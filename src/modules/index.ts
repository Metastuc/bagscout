import { tokensRepository } from "#/db/repository.ts";
import { appLogger } from "#/utils/log.ts";

import { cacheUtils } from "./utils/cache";

const appDependencies: AppDependencies = {
    cache: cacheUtils,
    dbTokens: tokensRepository,
    logger: appLogger,
};

export const withDependencies = async <T>(fn: (dependencies: AppDependencies) => Promise<T>): Promise<T> => fn(appDependencies);
