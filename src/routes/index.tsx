import { getAllTokensQueryOptions } from "#/api/get-tokens.ts";
import { useClientViewState } from "#/lib/store.ts";
import { DataTable } from "#/views/landing/components/table.tsx";
import { processTokenData } from "#/views/landing/utils.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { useShallow } from "zustand/shallow";

export const Route = createFileRoute("/")({
    component: RouteComponent,
    async loader({ context }) {
        await context.queryClient.ensureQueryData(getAllTokensQueryOptions());
    },
});


function RouteComponent() {
    const { data } = useSuspenseQuery(getAllTokensQueryOptions());
    const { activeTab, filters, setActiveTab, tablePageIndex, tablePageSize } = useClientViewState(
        useShallow((state) => ({
            activeTab: state.activeTab,
            filters: state.filters,
            tablePageIndex: state.tablePageIndex,
            tablePageSize: state.tablePageSize,
            setActiveTab: state.setActiveTab,
        })),
    );



    return <DataTable tokens={processTokenData(data.tokens, activeTab)} />;
}
