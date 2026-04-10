import { tokensRepository } from "#/db/repository.ts";
import type { appLogger } from "#/utils/log.ts";

import { cacheUtils } from "./utils/cache";

interface LocalDependencies {
    cache: typeof cacheUtils;
    dbTokens: typeof tokensRepository;
    logger: typeof appLogger;
}

declare global {
    type AppDependencies = LocalDependencies & {};
}
export {};
