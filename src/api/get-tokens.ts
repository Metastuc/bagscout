import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getPoolsFromBags, getTokensFromBags } from "#/modules/services/bags.ts";
import { getGeckoPool } from "#/modules/services/gecko.ts";
import { mergeBagsTokenWithPool } from "#/modules/utils/merge-bags-pool.ts";

import { withDependencies } from "../modules";

const getTokensServerFn = createServerFn({ method: "GET" }).handler(
    async () =>
        await withDependencies(async (deps) => {
            try {
                const cache = deps.cache.readCache();
                if (deps.cache.isCacheValid(cache)) {
                    deps.logger.info({ msg: "Cache hit", data: { lastFetched: cache?.lastFetched } });
                    return { tokens: (cache?.tokens as Array<MergedBagsTokenWithPool>) ?? [] };
                }
                const [allBagsTokens, allBagsPools] = await Promise.all([getTokensFromBags(deps), getPoolsFromBags(deps)]);
                const merged = mergeBagsTokenWithPool(allBagsTokens ?? [], allBagsPools ?? []);

                const allTokens: Array<MergedBagsTokenWithPool> = await Promise.all(
                    merged.map(async (token) => {
                        if (!token.poolAddress) return token;
                        try {
                            const geckoData = await getGeckoPool(token.poolAddress, deps);
                            return { ...token, geckoData: geckoData ?? undefined };
                        } catch (error) {
                            deps.logger.error({ msg: (error as Error).message, data: { stack: (error as Error).stack } });
                            return { ...token, geckoData: undefined };
                        }
                    }),
                );

                deps.cache.writeCache(allTokens);
                return { tokens: allTokens };
            } catch (error) {
                deps.logger.error({ msg: (error as Error).message, data: { stack: (error as Error).stack } });
                return { tokens: [] };
            }
        }),
);

export const getAllTokensQueryOptions = () =>
    queryOptions({
        queryKey: ["all_tokens"],
        queryFn: () => getTokensServerFn(),
    });
