import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { withDependencies } from "../modules";

const searchTokensServerFn = createServerFn({ method: "GET" })
    .inputValidator(z.object({ query: z.string().optional() }))
    .handler(async function ({ data: { query } }) {
        return await withDependencies(async (deps) => {
            try {
                return { tokens: await deps.tokensRepository.searchTokens(query ?? "") };
            } catch (error) {
                deps.logger.error({ msg: (error as Error).message, data: { stack: (error as Error).stack } });
                return { tokens: [] };
            }
        });
    });

export const searchTokensQueryOptions = (query: string) =>
    queryOptions({
        enabled: query.length > 2,
        placeholderData: (previous) => previous,
        queryFn: () => searchTokensServerFn({ data: { query } }),
        queryKey: ["search_tokens", query],
    });
