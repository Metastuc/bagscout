import type { cacheUtils } from "#/utils/cache.ts";
import type { appLogger } from "#/utils/log.ts";

interface LocalDependencies {
  logger: typeof appLogger;
  cache: typeof cacheUtils;
}

declare global {
  type AppDependencies = LocalDependencies & {};
}
export {};
