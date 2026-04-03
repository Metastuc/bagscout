import type { appLogger } from "#/utils/log.ts";

import { cacheUtils } from "./utils/cache";

interface LocalDependencies {
    logger: typeof appLogger;
    cache: typeof cacheUtils;
}

declare global {
    type AppDependencies = LocalDependencies & {};
}
export {};
