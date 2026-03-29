import { cn } from "#/lib/utils.ts";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

interface DataTableProps {
    tokens: Array<MergedBagsTokenWithPool>;
}

const tableColumns: Array<ColumnDef<MergedBagsTokenWithPool>> = [
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

        header: "Token",

        id: "token",
    },

    {
        cell({ row }) {
            return parseFloat(row.original.geckoData?.attributes.base_token_price_usd || "0").toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
            });
        },

        header: "Price",

        id: "price",
    },

    {
        cell({ row }) {
            const value = parseFloat(row.original.geckoData?.attributes.price_change_percentage.m5 ?? "0");
            return <span className={cn(value >= 0 ? "text-green-500" : "text-red-500")}>{value}</span>;
        },

        header: "5m",

        id: "m5",
    },

    {
        cell({ row }) {
            const value = parseFloat(row.original.geckoData?.attributes.price_change_percentage.h1 ?? "0");
            return <span className={cn(value >= 0 ? "text-green-500" : "text-red-500")}>{value}</span>;
        },

        header: "1h",

        id: "h1",
    },

    {
        cell({ row }) {
            const value = parseFloat(row.original.geckoData?.attributes.price_change_percentage.h24 ?? "0");
            return <span className={cn(value >= 0 ? "text-green-500" : "text-red-500")}>{value}</span>;
        },

        header: "24h",

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
            const [mCap, fdv] = [
                parseFloat(row.original.geckoData?.attributes.market_cap_usd ?? "0"),
                parseFloat(row.original.geckoData?.attributes.fdv_usd ?? "0"),
            ];

            return mCap || fdv;
        },

        header: "MCap",

        id: "mCap",
    },

    {
        cell({ row }) {
            return (row.original.geckoData?.attributes.transactions.h24.buys ?? 0) + (row.original.geckoData?.attributes.transactions.h24.sells ?? 0);
        },

        header: "Txns",

        id: "txns",
    },

    {
        cell({ row }) {
            return row.original.geckoData?.attributes.pool_created_at;
        },

        header: "Age",

        id: "age",
    },
];

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
        estimateSize: () => 50,
    });

    return (
        <section className="border border-yellow-800 size-full">
            <div className="size-full overflow-auto">
                <header
                    className="grid border-y"
                    style={{
                        gridTemplateColumns: `repeat(${table.getAllColumns().length}, minmax(0, 1fr))`,
                    }}
                >
                    {table.getHeaderGroups().map((headerGroup) =>
                        headerGroup.headers.map((header) => (
                            <div key={header.id}>
                                <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
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
                                    key={row.id}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    <div
                                        className="grid border-b"
                                        style={{
                                            gridTemplateColumns: `repeat(${table.getAllColumns().length}, minmax(0, 1fr))`,
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <div key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </footer>
            </div>
        </section>
    );
}
