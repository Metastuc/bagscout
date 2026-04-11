import { createTokensRepository } from "#/db/repository.ts";
import type { appLogger } from "#/utils/log.ts";

import { db } from "../db";
import { redis } from "./core/redis";
import { createTokenService } from "./factories/token";

declare global {
    interface CoreDependencies {
        db: typeof db;
        logger: typeof appLogger;
        redis: typeof redis;
    }

    interface Repositories {
        tokensRepository: ReturnType<typeof createTokensRepository>;
    }

    interface Services {
        tokensService: ReturnType<typeof createTokenService>;
    }

    type AppDependencies = CoreDependencies & Repositories & Services;
}
export {};
