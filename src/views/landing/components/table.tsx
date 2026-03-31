import { useNavigate } from "@tanstack/react-router";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useRef } from "react";

import { cn } from "#/lib/utils.ts";

import { GRID_COLUMNS } from "../constants";
import { shouldAlignRight } from "../utils";
import { TABLE_COLUMNS } from "./columns";

interface DataTableProps {
    tokens: Array<MergedBagsTokenWithPool>;
}

export const DataTable = memo(function ({ tokens }: DataTableProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate({ from: "/" });

    const table = useReactTable({
        data: tokens,
        columns: TABLE_COLUMNS,
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
                <aside
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
                </aside>

                <aside ref={parentRef}>
                    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const row = table.getRowModel().rows[virtualRow.index];

                            return (
                                <div
                                    className="grid min-w-full border-y"
                                    key={row.id}
                                    style={{
                                        gridTemplateColumns: GRID_COLUMNS,
                                        height: `${virtualRow.size}px`,
                                        left: 0,
                                        position: "absolute",
                                        top: 0,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                    onClick={() => {
                                        navigate({
                                            search: (previous) => ({ ...previous, token: row.original.tokenMint }),
                                        });
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
                </aside>
            </div>
        </section>
    );
});
