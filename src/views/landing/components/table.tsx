import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

interface DataTableProps {
    tokens: Array<MergedBagsTokenWithPool>;
}

const tableColumns: Array<ColumnDef<MergedBagsTokenWithPool>> = [{ accessorFn: (row) => row.name, id: "name", header: "Name" }];

export function DataTable({ tokens }: DataTableProps) {
    const table = useReactTable({
        data: tokens,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    const parentRef = useRef<HTMLDivElement>(null);
    const rowVirtualizer = useVirtualizer({
        count: table.getRowModel().rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 50,
    });

    return (
        <section className="border border-yellow-800 size-full">
            <div className="size-full overflow-auto">
                <header className="grid">
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
                                <div key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <div key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
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
