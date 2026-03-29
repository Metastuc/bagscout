import { getAllTokensQueryOptions } from "#/api/get-tokens.ts";
import { useClientViewState } from "#/lib/store.ts";
import { DataTable } from "#/views/landing/components/table.tsx";
import { processTokenData } from "#/views/landing/utils.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: RouteComponent,
    async loader({ context }) {
        await context.queryClient.ensureQueryData(getAllTokensQueryOptions());
    },
});

function RouteComponent() {
    const { data } = useSuspenseQuery(getAllTokensQueryOptions());
    const activeTab = useClientViewState((state) => state.activeTab);

    return <DataTable tokens={processTokenData(data.tokens, activeTab)} />;
}
