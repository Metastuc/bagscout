import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { toTime } from "#/utils/time.ts";

import { withDependencies } from "../modules";

const getTokensServerFn = createServerFn({ method: "GET" }).handler(
    async () =>
        await withDependencies(async (deps) => {
            try {
                const cache = deps.cache.readCache();

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
        placeholderData: (previous) => previous,
        refetchInterval: toTime({ unit: "seconds", value: 30, output: "milliseconds" }) as number,
        refetchIntervalInBackground: true,
        staleTime: toTime({ unit: "seconds", value: 20, output: "milliseconds" }) as number,
    });
