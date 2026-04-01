import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, memo, useEffect, useRef } from "react";
import { useIntersectionObserver } from "usehooks-ts";

import { useClientViewState } from "#/lib/store.ts";
import { cn } from "#/lib/utils.ts";

import { GRID_COLUMNS, STICKY_OFFSET } from "../constants";
import { shouldAlignRight } from "../utils";
import { TABLE_COLUMNS } from "./columns";

interface DataTableProps {
  fetchNextPage: ReturnType<typeof useInfiniteQuery>["fetchNextPage"];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  tokens: Array<MergedBagsTokenWithPool>;
}

export const DataTable = memo(function ({
  fetchNextPage,
  tokens,
  hasNextPage,
  isFetchingNextPage,
}: DataTableProps) {
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
      <div ref={parentRef} className="size-full overflow-auto">
        <aside
          className="sticky top-0 z-20 grid w-max min-w-full border-b bg-black backdrop-blur-xs"
          style={{ gridTemplateColumns: GRID_COLUMNS }}
        >
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => {
              const isSticky =
                header.column.id === "rank" || header.column.id === "token";

              return (
                <div
                  key={header.id}
                  className={cn(
                    "px-3 py-2 text-sm font-medium uppercase",
                    isSticky && "sticky bg-background z-30",
                    shouldAlignRight(header.id) ? "text-right" : "text-left",
                  )}
                  style={{
                    left: isSticky
                      ? STICKY_OFFSET[
                          header.column.id as keyof typeof STICKY_OFFSET
                        ]
                      : undefined,
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </div>
              );
            }),
          )}
        </aside>

        <aside>
          {table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="hover:bg-muted/30 grid min-w-fit cursor-pointer border-b"
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
                const isSticky =
                  cell.column.id === "rank" || cell.column.id === "token";

                return (
                  <div
                    key={cell.id}
                    className={cn(
                      "px-3 py-2 flex items-center",
                      shouldAlignRight(cell.column.id)
                        ? "justify-end"
                        : "justify-start",
                      isSticky &&
                        "sticky bg-background z-10 border-r border-border",
                    )}
                    style={{
                      left: isSticky
                        ? STICKY_OFFSET[
                            cell.column.id as keyof typeof STICKY_OFFSET
                          ]
                        : undefined,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                );
              })}
            </div>
          ))}
        </aside>

        <div
          ref={ref}
          className="flex flex-col items-center justify-center gap-2 py-6"
        >
          {hasNextPage ? (
            <Fragment>
              <div className="border-muted border-t-foreground h-5 w-5 animate-spin rounded-full border-2" />
              <span className="text-muted-foreground text-sm">
                Loading more tokens...
              </span>
            </Fragment>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-muted-foreground text-sm">
                You’ve reached the end 👀
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});
