import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { withDependencies } from "../modules";

export const getTokensServerFn = createServerFn({ method: "GET" })
    .inputValidator(
        z.object({
            cursor: z.string().optional(),
            limit: z.number(),
            tab: z.enum(["new", "top_losers", "top_gainers", "top_bags", "trending"]),
        }),
    )
    .handler(
        async ({ data: { limit, tab, cursor } }) =>
            await withDependencies(async (deps) => {
                try {
                    const tokens = await deps.tokensService.getAllTokens();

                    if (!tokens.length) {
                        deps.logger.warn({ msg: "Cache miss - worker not ready yet" });
                        return { tokens: [], nextCursor: undefined };
                    }

                    const sortedTokens = processTokenData(tokens, tab);
                    const startIndex = cursor ? sortedTokens.findIndex((token) => token.tokenMint === cursor) + 1 : 0;
                    const paginatedTokens = sortedTokens.slice(startIndex, startIndex + limit);
                    const nextCursor = paginatedTokens.length > 0 ? paginatedTokens[paginatedTokens.length - 1].tokenMint : undefined;

                    return { tokens: paginatedTokens, nextCursor };
                } catch (error) {
                    deps.logger.error({
                        msg: (error as Error).message,
                        data: { stack: (error as Error).stack },
                    });
                    return { tokens: [], nextCursor: undefined };
                }
            }),
    );

function processTokenData(tokens: Array<MergedBagsTokenWithPool>, activeTab: DiscoverTabs): Array<MergedBagsTokenWithPool> {
    return tokens
        .filter((token) => {
            switch (activeTab) {
                case "trending":
                    return (token.status === "PRE_GRAD" || token.status === "MIGRATED") && !!token.geckoData?.data?.attributes;

                case "new":
                    return token.status === "PRE_LAUNCH" || token.status === "PRE_GRAD";

                case "top_bags":
                    return !!token.geckoData?.data?.attributes;

                case "top_gainers":
                    return !!token.geckoData?.data?.attributes && Number(token.geckoData?.data?.attributes.price_change_percentage.h24 ?? 0) > 0;

                case "top_losers":
                    return !!token.geckoData?.data?.attributes && Number(token.geckoData?.data?.attributes.price_change_percentage.h24 ?? 0) < 0;

                default:
                    return true;
            }
        })
        .sort((a, b) => {
            switch (activeTab) {
                case "trending":
                    return Number(b.geckoData?.data?.attributes.volume_usd.h24 ?? 0) - Number(a.geckoData?.data?.attributes.volume_usd.h24 ?? 0);

                case "new":
                    return (
                        new Date(b.geckoData?.data?.attributes.pool_created_at ?? 0).getTime() -
                        new Date(a.geckoData?.data?.attributes.pool_created_at ?? 0).getTime()
                    );

                case "top_gainers":
                    return (
                        Number(b.geckoData?.data?.attributes.price_change_percentage.h24 ?? 0) -
                        Number(a.geckoData?.data?.attributes.price_change_percentage.h24 ?? 0)
                    );

                case "top_losers":
                    return (
                        Number(a.geckoData?.data?.attributes.price_change_percentage.h24 ?? 0) -
                        Number(b.geckoData?.data?.attributes.price_change_percentage.h24 ?? 0)
                    );

                case "top_bags":
                    return Number(b.geckoData?.data?.attributes.fdv_usd ?? 0) - Number(a.geckoData?.data?.attributes.fdv_usd ?? 0);

                default:
                    return 0;
            }
        });
}
