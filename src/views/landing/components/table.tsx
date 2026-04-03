import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Fragment, memo, useEffect, useRef } from "react";
import { useIntersectionObserver } from "usehooks-ts";

import { useClientViewState } from "#/lib/store.ts";
import { cn } from "#/lib/utils.ts";

import { GRID_COLUMNS } from "../constants";
import { shouldAlignRight } from "../utils";
import { TABLE_COLUMNS } from "./columns";

interface DataTableProps {
    fetchNextPage: ReturnType<typeof useInfiniteQuery>["fetchNextPage"];
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    tokens: Array<MergedBagsTokenWithPool>;
}

export const DataTable = memo(function ({ fetchNextPage, tokens, hasNextPage, isFetchingNextPage }: DataTableProps) {
    const isFetching = useRef<boolean>(false);
    const parentRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate({ from: "/" });
    const activeTab = useClientViewState((state) => state.activeTab);

    const table = useReactTable({
        data: tokens,
        columns: TABLE_COLUMNS,
        getCoreRowModel: getCoreRowModel(),
    });

    const { isIntersecting, ref } = useIntersectionObserver({
        threshold: 0.5,
        rootMargin: "0px 0px 100px 0px",
    });

    useEffect(() => {
        if (!isIntersecting) return;

        if (hasNextPage && !isFetchingNextPage && !isFetching.current) {
            isFetching.current = true;

            fetchNextPage().finally(() => {
                isFetching.current = false;
            });
        }
    }, [isIntersecting, hasNextPage, isFetchingNextPage]);

    useEffect(() => {
        parentRef.current?.scrollTo({ behavior: "smooth", left: 0, top: 0 });
    }, [activeTab]);

    return (
        <section className="size-full overflow-hidden">
            <div
                ref={parentRef}
                className="scrollbar scrollbar-thumb-muted-foreground/30 hover:scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent size-full overflow-auto"
            >
                <aside
                    className="sticky top-0 z-30 grid w-max min-w-full border-b bg-black/75 backdrop-blur-xs"
                    style={{ gridTemplateColumns: GRID_COLUMNS }}
                >
                    {table.getHeaderGroups().map((headerGroup) =>
                        headerGroup.headers.map((header) => {
                            return (
                                <div
                                    key={header.id}
                                    className={cn(
                                        "px-3 py-2 text-sm text-muted-foreground font-medium uppercase",
                                        shouldAlignRight(header.id) ? "text-right" : "text-left",
                                        header.column.id === "token" && "sticky left-0 lg:left-15 bg-background/75 backdrop-blur-xs",
                                        header.column.id === "rank" && "lg:sticky lg:left-0 bg-background/75 backdrop-blur-xs",
                                    )}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </div>
                            );
                        }),
                    )}
                </aside>

                <aside>
                    {table.getRowModel().rows.map((row) => (
                        <div
                            key={row.id}
                            className="hover:bg-muted/30 group grid min-w-fit cursor-pointer border-b"
                            style={{ gridTemplateColumns: GRID_COLUMNS }}
                            onClick={() =>
                                navigate({
                                    search: (previous) => ({
                                        ...previous,
                                        token: row.original.tokenMint,
                                    }),
                                })
                            }
                        >
                            {row.getVisibleCells().map((cell) => {
                                return (
                                    <div
                                        key={cell.id}
                                        className={cn(
                                            "px-3 py-2 flex items-center",
                                            shouldAlignRight(cell.column.id) ? "justify-end" : "justify-start",
                                            cell.column.id === "token" &&
                                                "sticky left-0 lg:left-15 bg-black z-20 border-r border-border shadow-[2px_0_6px_rgba(0,0,0,0.2)]",
                                            cell.column.id === "rank" && "lg:sticky lg:left-0 bg-black z-20 border-r border-border",
                                        )}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </aside>

                <div ref={ref} className="sticky left-0 flex flex-col items-center justify-center gap-2 py-5">
                    {hasNextPage ? (
                        <Fragment>
                            <div className="border-muted border-t-foreground h-5 w-5 animate-spin rounded-full border-2" />
                            <span className="text-muted-foreground text-sm">Loading more tokens...</span>
                        </Fragment>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                            <span className="text-muted-foreground text-sm">You’ve reached the end 👀</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
});
