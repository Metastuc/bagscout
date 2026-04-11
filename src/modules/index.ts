import { createTokensRepository } from "#/db/repository.ts";
import { appLogger } from "#/utils/log.ts";

import { db } from "../db";
import { redis } from "./core/redis";
import { createTokenService } from "./factories/token";

const coreDependencies: CoreDependencies = { db, logger: appLogger, redis };

const repositories: Repositories = { tokensRepository: createTokensRepository(coreDependencies) };

const services = {
    tokensService: createTokenService({ ...coreDependencies, ...repositories }),
};

const appDependencies: AppDependencies = {
    ...coreDependencies,
    ...repositories,
    ...services,
};

export const withDependencies = async <T>(fn: (dependencies: AppDependencies) => Promise<T>): Promise<T> => fn(appDependencies);
