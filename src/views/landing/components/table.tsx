import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

import { cn } from "#/lib/utils.ts";

import { GRID_COLUMNS } from "../constants";
import { computeTokenAge, formatPriceToUSD, formatTokenNumber } from "../utils";

interface DataTableProps {
    tokens: Array<MergedBagsTokenWithPool>;
}

const tableColumns: Array<ColumnDef<MergedBagsTokenWithPool>> = [
    {
        cell({ row }) {
            return row.index + 1;
        },

        enableSorting: false,

        header: "#",

        id: "rank",
    },

    {
        cell({ row }) {
            return (
                <div className="flex items-center gap-2 border">
                    <img src={row.original.image} className="w-6 h-6 rounded-full" />
                    <div>
                        <div className="font-medium">{row.original.symbol}</div>
                        <div className="text-xs text-gray-400">{row.original.name}</div>
                    </div>
                    <span className="text-[10px] px-1 rounded bg-gray-700">{row.original.status}</span>
                </div>
            );
        },

        enableSorting: false,

        header: "Token",

        id: "token",
    },

    {
        cell({ row }) {
            return formatPriceToUSD(parseFloat(row.original.geckoData?.attributes.base_token_price_usd ?? "0"));
        },

        header: "Price",

        id: "price",

        sortingFn: "basic",
    },

    {
        cell({ row }) {
            const value = parseFloat(row.original.geckoData?.attributes.price_change_percentage.m5 ?? "0");
            return <span className={cn(value >= 0 ? "text-green-500" : "text-red-500")}>{value}</span>;
        },

        header: "5m %",

        id: "m5",

        sortingFn: "basic",
    },

    {
        cell({ row }) {
            const value = parseFloat(row.original.geckoData?.attributes.price_change_percentage.h24 ?? "0");
            return <span className={cn(value >= 0 ? "text-green-500" : "text-red-500")}>{value}</span>;
        },

        header: "24h %",

        id: "h24",
    },

    {
        cell({ row }) {
            return parseFloat(row.original.geckoData?.attributes.volume_usd.h24 ?? "0").toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
            });
        },

        header: "Volume",

        id: "volume",
    },
    {
        cell({ row }) {
            return parseFloat(row.original.geckoData?.attributes.reserve_in_usd ?? "0").toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
            });
        },

        header: "Liquidity",

        id: "liquidity",
    },

    {
        cell({ row }) {
            return formatTokenNumber(
                parseFloat(row.original.geckoData?.attributes.market_cap_usd ?? "0") || parseFloat(row.original.geckoData?.attributes.fdv_usd ?? "0"),
            );
        },

        header: "MCap",

        id: "mCap",

        sortingFn: "basic",
    },

    {
        cell({ row }) {
            return (
                (row.original.geckoData?.attributes.transactions.h24.buys ?? 0) + (row.original.geckoData?.attributes.transactions.h24.sells ?? 0)
            ).toLocaleString();
        },

        header: "Txns",

        id: "txns",

        sortingFn: "basic",
    },

    {
        cell({ row }) {
            return computeTokenAge(row.original.geckoData?.attributes.pool_created_at ?? "");
        },

        header: "Age",

        id: "age",

        sortingFn: "basic",
    },

    {
        cell({ row }) {
            return <>action</>;
        },

        enableSorting: false,

        header: "Actions",

        id: "actions",
    },
];

function shouldAlignRight(columnId: string): boolean {
    return !["token", "rank"].includes(columnId);
}

export function DataTable({ tokens }: DataTableProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    const table = useReactTable({
        data: tokens,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    const rowVirtualizer = useVirtualizer({
        count: table.getRowModel().rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 75,
    });

    return (
        <section className="size-full overflow-hidden">
            <div className="size-full overflow-auto">
                <header
                    className="grid min-w-full"
                    style={{
                        gridTemplateColumns: GRID_COLUMNS,
                    }}
                >
                    {table.getHeaderGroups().map((headerGroup) =>
                        headerGroup.headers.map((header) => (
                            <div key={header.id} className={cn("py-2 px-3", shouldAlignRight(header.id) ? "text-right" : "text-left")}>
                                <span className="uppercase">{flexRender(header.column.columnDef.header, header.getContext())}</span>
                            </div>
                        )),
                    )}
                </header>

                <footer ref={parentRef}>
                    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const row = table.getRowModel().rows[virtualRow.index];

                            return (
                                <div
                                    className="grid border-y min-w-full"
                                    key={row.id}
                                    style={{
                                        gridTemplateColumns: GRID_COLUMNS,
                                        height: `${virtualRow.size}px`,
                                        left: 0,
                                        position: "absolute",
                                        top: 0,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <div key={cell.id} className={cn("py-2 px-3", shouldAlignRight(cell.id) ? "text-right" : "text-left")}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </footer>
            </div>
        </section>
    );
}
