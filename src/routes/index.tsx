import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Fragment, lazy, Suspense, useEffect, useMemo } from "react";
import { useShallow } from "zustand/shallow";

import { getTokensServerFn } from "#/api/get-tokens.ts";
import { useClientViewState } from "#/lib/store.ts";
import { toTime } from "#/utils/time.ts";
import { DataTable } from "#/views/landing/components/table.tsx";

const TokenDetailsModal = lazy(() => import("#/views/landing/components/modal.tsx").then((module) => ({ default: module.TokenDetailsModal })));

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
        useShallow((state) => ({ activeTab: state.activeTab, setTickerTokens: state.setTickerTokens })),
    );

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
        TokensPage,
        Error,
        InfiniteData<TokensPage>,
        [string, NavigationTab],
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
    const selectedToken = token ? allTokens.find((t) => t.tokenMint === token) : undefined;
    const tickerTokens = useMemo(
        () =>
            [...allTokens]
                .sort(
                    (a, b) =>
                        (Number(b.geckoData?.data?.attributes.volume_usd?.h24) || 0) - (Number(a.geckoData?.data?.attributes.volume_usd?.h24) || 0),
                )
                .slice(0, 20),
        [allTokens],
    );

    useEffect(
        function () {
            setTickerTokens(tickerTokens);
        },
        [tickerTokens],
    );

    return (
        <Fragment>
            <section className="lg:hidden">mobile nav</section>

            <DataTable fetchNextPage={fetchNextPage} tokens={allTokens} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} />

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
