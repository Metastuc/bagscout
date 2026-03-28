import { getAllTokensQueryOptions } from "#/api/get-tokens.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

type PageSearch = {};

export const Route = createFileRoute("/")({
    component: RouteComponent,
    async loader({ context }) {
        await context.queryClient.ensureQueryData(getAllTokensQueryOptions());
    },
    validateSearch(search: Record<string, unknown>): PageSearch {
        return {
            
        };
    }
});

function RouteComponent() {
    const { data: allTokensQuery, isPending, isError } = useSuspenseQuery(getAllTokensQueryOptions());

    console.log(allTokensQuery);

    return <div>Hello "/"!</div>;
}
