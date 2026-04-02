import { useInfiniteQuery, useQuery, type InfiniteData } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Fragment, lazy, Suspense, useEffect, useMemo } from "react";
import { useShallow } from "zustand/shallow";

import { getTickerQueryOptions } from "#/api/get-tickers.ts";
import { getTokensServerFn } from "#/api/get-tokens.ts";
import { useClientViewState } from "#/lib/store.ts";
import { toTime } from "#/utils/time.ts";
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

        await context.queryClient.prefetchQuery(getTickerQueryOptions());
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

    const { activeTab, setTickerTokens } = useClientViewState(
        useShallow((state) => ({
            activeTab: state.activeTab,
            setTickerTokens: state.setTickerTokens,
        })),
    );

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
        TokensPage,
        Error,
        InfiniteData<TokensPage>,
        [string, NavigationTab],
        string | undefined
    >({
        queryKey: ["all_tokens", activeTab],
        queryFn: ({ pageParam }) =>
            getTokensServerFn({
                data: { limit: 20, tab: activeTab, cursor: pageParam },
            }),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined,
        placeholderData: (previous) => previous,
        refetchInterval: toTime({
            unit: "seconds",
            value: 30,
            output: "milliseconds",
        }) as number,
        refetchIntervalInBackground: true,
        staleTime: toTime({
            unit: "seconds",
            value: 20,
            output: "milliseconds",
        }) as number,
    });

    const { data: tickerTokens } = useQuery(getTickerQueryOptions());

    const allTokens = useMemo(() => data?.pages.flatMap((page) => page.tokens) ?? [], [data]);
    const selectedToken = token ? allTokens.find((t) => t.tokenMint === token) : undefined;

    useEffect(
        function () {
            setTickerTokens(tickerTokens?.tokens ?? []);
        },
        [tickerTokens],
    );

    return (
        <Fragment>
            <nav className="h-20 lg:hidden">
                <ul>{/* mobile nav here */}</ul>
            </nav>

            <DataTable fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} tokens={allTokens} />

            <Suspense fallback={undefined}>
                {selectedToken ? (
                    <TokenDetailsModal
                        token={selectedToken}
                        onClose={() => {
                            navigate({ search: { token: undefined } });
                        }}
                    />
                ) : null}
            </Suspense>
        </Fragment>
    );
}

