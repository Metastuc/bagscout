import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { toTime } from "#/utils/time.ts";

import { withDependencies } from "../modules";

const getTokensServerFn = createServerFn({ method: "GET" }).handler(
    async () =>
        await withDependencies(async (deps) => {
            try {
                const cache = deps.cache.readCache();
                // if (deps.cache.isCacheValid(cache)) {
                //     deps.logger.info({ msg: "Cache hit", data: { lastFetched: cache?.lastFetched } });
                //     return { tokens: (cache?.tokens as Array<MergedBagsTokenWithPool>) ?? [] };
                // }
                // const [allBagsTokens, allBagsPools] = await Promise.all([getTokensFromBags(deps), getPoolsFromBags(deps)]);
                // const merged = mergeBagsTokenWithPool(allBagsTokens ?? [], allBagsPools ?? []);

                // const allTokens: Array<MergedBagsTokenWithPool> = await Promise.all(
                //     merged.map(async (token) => {
                //         if (!token.poolAddress) return token;
                //         try {
                //             const geckoData = await getGeckoPool(token.poolAddress, deps);
                //             return { ...token, geckoData: geckoData ? { data: geckoData, fetchedAt: Date.now() } : undefined };
                //         } catch (error) {
                //             deps.logger.error({ msg: (error as Error).message, data: { stack: (error as Error).stack } });
                //             return { ...token, geckoData: undefined };
                //         }
                //     }),
                // );

                // deps.cache.writeCache(allTokens);

                if (!cache) {
                    deps.logger.warn({ msg: "Cache miss - worker not ready yet" });
                    return { tokens: [] };
                }

                deps.logger.info({ msg: "Cache hit", data: { lastFetched: cache?.lastFetched, tokenCount: cache?.tokens?.length } });
                return { tokens: cache?.tokens as Array<MergedBagsTokenWithPool> };
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
        refetchInterval: toTime({ unit: "seconds", value: 30, output: "milliseconds" }) as number,
    });
