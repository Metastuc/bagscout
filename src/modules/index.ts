import { cacheUtils } from "#/utils/cache.ts";
import { appLogger } from "#/utils/log.ts";

const appDependencies: AppDependencies = {
    logger: appLogger,
    cache: cacheUtils
};

export const withDependencies = async <T>(fn: (dependencies: AppDependencies) => Promise<T>): Promise<T> => fn(appDependencies);
