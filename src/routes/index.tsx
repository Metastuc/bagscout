import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { withDependencies } from "../modules";
import { getPoolsFromBags, getTokensFromBags } from "#/modules/services/bags.ts";
import { mergeBagsTokenWithPool } from "#/modules/utils/merge-bags-pool.ts";
import { getGeckoPool } from "#/modules/services/gecko.ts";

export const Route = createFileRoute("/")({
    component: RouteComponent
});

const getData = createServerFn({ method: "GET" }).handler(async () =>
    withDependencies(async function (deps) {
        try {
            const cache = deps.cache.readCache();
            if (deps.cache.isCacheValid(cache)) {
                deps.logger.info({ msg: "Cache hit", data: { lastFetched: cache?.lastFetched } });
                return { tokens: cache?.tokens ?? [] };
            }

            const [allBagsTokens, allBagsPools] = await Promise.all([getTokensFromBags(deps), getPoolsFromBags(deps)]);

            const merged = mergeBagsTokenWithPool(allBagsTokens ?? [], allBagsPools ?? []);
            const allTokens = await Promise.all(
                merged.map(async (token) => {
                    if (!token.poolAddress) return token;
                    try {
                        const geckoData = await getGeckoPool(token.poolAddress, deps);
                        return { ...token, geckoData };
                    } catch (error) {
                        deps.logger.error({ msg: (error as Error).message, data: { stack: (error as Error).stack } });
                        return token; // Return original token data if Gecko fetch fails
                    }
                })
            );

            deps.cache.writeCache(allTokens);
            return { tokens: allTokens };
        } catch (error) {
            deps.logger.error({ msg: (error as Error).message, data: { stack: (error as Error).stack } });
            return { tokens: [] };
        }
    })
);

function RouteComponent() {
    getData();

    return <div>Hello "/"!</div>;
}
