import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { toTime } from "#/utils/time.ts";

import { withDependencies } from "../modules";

const getTickersServerFn = createServerFn({ method: "GET" }).handler(async () => {
    return await withDependencies(async (deps) => {
        const cache = deps.cache.readCache();
        if (!cache) return { tokens: [] };

        const topTokens = [...cache.tokens]
            .sort(
                (a, b) => (Number(b.geckoData?.data?.attributes.volume_usd?.h24) || 0) - (Number(a.geckoData?.data?.attributes.volume_usd?.h24) || 0),
            )
            .slice(0, 20);

        return { tokens: topTokens };
    });
});

export const getTickerQueryOptions = () =>
    queryOptions({
        queryKey: ["ticker_tokens"],
        queryFn: getTickersServerFn,
        refetchInterval: toTime({ unit: "seconds", value: 15, output: "milliseconds" }) as number,
        refetchIntervalInBackground: true,
        staleTime: toTime({ unit: "seconds", value: 10, output: "milliseconds" }) as number,
    });
