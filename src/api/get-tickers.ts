import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { toTime } from "#/utils/time.ts";

import { withDependencies } from "../modules";

const getTickersServerFn = createServerFn({ method: "GET" }).handler(async () => {
    return await withDependencies(async (deps) => {
        const tokens = await deps.cache.getTickerTokens();
        if (!tokens.length) return { tokens: [] };

        return { tokens };
    });
});

export const getTickerQueryOptions = () =>
    queryOptions({
        queryKey: ["ticker_tokens"],
        queryFn: getTickersServerFn,
        refetchInterval: toTime({
            unit: "seconds",
            value: 15,
            output: "milliseconds",
        }) as number,
        refetchIntervalInBackground: true,
        staleTime: toTime({
            unit: "minutes",
            value: 1,
            output: "milliseconds",
        }) as number,
    });
