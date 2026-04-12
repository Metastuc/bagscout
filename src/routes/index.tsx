import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Fragment, lazy, Suspense, useMemo } from "react";

import { getTickerQueryOptions } from "#/api/get-tickers.ts";
import { getTokensServerFn } from "#/api/get-tokens.ts";
import { useClientViewState } from "#/lib/store.ts";
import { toTime } from "#/utils/time.ts";
import { LandingNavigation } from "#/views/landing/components/navigation.tsx";
import { DataTable } from "#/views/landing/components/table.tsx";

const TokenDetailsModal = lazy(() =>
    import("#/views/landing/components/modal.tsx").then((module) => ({
        default: module.TokenDetailsModal,
    })),
);

interface RouteSearchParams {
    token?: string;
}

export const Route = createFileRoute("/")({
    component: RouteComponent,

    async loader({ context }) {
        await context.queryClient.prefetchInfiniteQuery({
            queryKey: ["all_tokens", "trending"],
            queryFn: ({ pageParam }) =>
                getTokensServerFn({
                    data: { limit: 20, tab: "trending", cursor: pageParam },
                }),
            initialPageParam: undefined,
        });

        await context.queryClient.ensureQueryData(getTickerQueryOptions());
    },

    validateSearch(search: Record<string, unknown>): RouteSearchParams {
        return {
            token: typeof search.token === "string" ? search.token : undefined,
        };
    },
});

function RouteComponent() {
    const navigate = Route.useNavigate();
    const { token } = Route.useSearch();

    const activeTab = useClientViewState((state) => state.activeTab);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
        TokensPage,
        Error,
        InfiniteData<TokensPage>,
        [string, DiscoverTabs],
        string | undefined
    >({
        queryKey: ["all_tokens", activeTab],
        queryFn: ({ pageParam }) => getTokensServerFn({ data: { limit: 20, tab: activeTab, cursor: pageParam } }),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined,
        placeholderData: (previous) => previous,
        refetchInterval: toTime({ unit: "seconds", value: 30, output: "milliseconds" }) as number,
        refetchIntervalInBackground: true,
        staleTime: toTime({ unit: "seconds", value: 20, output: "milliseconds" }) as number,
    });

    const allTokens = useMemo(() => data?.pages.flatMap((page) => page.tokens) ?? [], [data]);

    return (
        <Fragment>
            <LandingNavigation />

            <DataTable fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} tokens={allTokens} />

            <Suspense fallback={undefined}>
                {token ? (
                    <TokenDetailsModal
                        tokenMint={token}
                        onClose={() => {
                            void navigate({ search: { token: undefined } });
                        }}
                    />
                ) : null}
            </Suspense>
        </Fragment>
    );
}
