import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Fragment, lazy, Suspense, useEffect, useMemo } from "react";
import { useShallow } from "zustand/shallow";

import { getAllTokensQueryOptions } from "#/api/get-tokens.ts";
import { useClientViewState } from "#/lib/store.ts";
import { DataTable } from "#/views/landing/components/table.tsx";
import { processTokenData } from "#/views/landing/utils.ts";

const TokenDetailsModal = lazy(() => import("#/views/landing/components/modal.tsx").then((module) => ({ default: module.TokenDetailsModal })));

interface RouteSearchParams {
    token?: string;
}

export const Route = createFileRoute("/")({
    component: RouteComponent,

    async loader({ context }) {
        await context.queryClient.ensureQueryData(getAllTokensQueryOptions());
    },

    validateSearch(search: Record<string, unknown>): RouteSearchParams {
        return {
            token: typeof search.token === "string" ? search.token : undefined,
        };
    },
});

function RouteComponent() {
    const { data } = useSuspenseQuery(getAllTokensQueryOptions());

    const navigate = Route.useNavigate();
    const { token } = Route.useSearch();

    const { activeTab, setTickerTokens } = useClientViewState(
        useShallow((state) => ({ activeTab: state.activeTab, setTickerTokens: state.setTickerTokens })),
    );

    const selectedToken = token ? data?.tokens.find((t) => t.tokenMint === token) : undefined;
    const processedTokensMemo = useMemo(() => processTokenData(data.tokens, activeTab), [data.tokens, activeTab]);

    useEffect(
        function () {
            setTickerTokens(
                data.tokens
                    .sort(
                        (a, b) =>
                            (Number(b.geckoData?.data?.attributes.volume_usd?.h24) || 0) -
                            (Number(a.geckoData?.data?.attributes.volume_usd?.h24) || 0),
                    )
                    .slice(0, 20),
            );
        },
        [data.tokens],
    );

    return (
        <Fragment>
            <section className="lg:hidden">mobile nav</section>

            <DataTable tokens={processedTokensMemo} />

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
