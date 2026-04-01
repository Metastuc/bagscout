import type { ColumnDef } from "@tanstack/react-table";

import { cn } from "#/lib/utils.ts";

import {
  computeTokenAge,
  formatPercentage,
  formatPriceToUSD,
  formatTokenPrice,
} from "../utils";
import { StatusTag } from "./status";

export const TABLE_COLUMNS: Array<ColumnDef<MergedBagsTokenWithPool>> = [
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
        <div className="flex size-full gap-2">
          <aside className="flex items-center justify-center">
            <img src={row.original.image} className="size-10 rounded-xs" />
          </aside>

          <aside className="flex flex-col items-start gap-1">
            <div className="font-medium">{row.original.symbol}</div>
            <StatusTag status={row.original.status} />
          </aside>
        </div>
      );
    },

    enableSorting: false,

    header: "Token",

    id: "token",
  },

  {
    cell({ row }) {
      return formatPriceToUSD(
        parseFloat(
          row.original.geckoData?.data?.attributes.base_token_price_usd ?? "0",
        ),
      );
    },

    header: "Price",

    id: "price",

    sortingFn: "basic",
  },

  {
    cell({ row }) {
      const value = parseFloat(
        row.original.geckoData?.data?.attributes.price_change_percentage.m5 ??
          "0",
      );
      return (
        <span className={cn(value >= 0 ? "text-green-500" : "text-red-500")}>
          {formatPercentage(value)}
        </span>
      );
    },

    header: "5m %",

    id: "m5",

    sortingFn: "basic",
  },

  {
    cell({ row }) {
      const value = parseFloat(
        row.original.geckoData?.data?.attributes.price_change_percentage.h24 ??
          "0",
      );
      return (
        <span className={cn(value >= 0 ? "text-green-500" : "text-red-500")}>
          {formatPercentage(value)}
        </span>
      );
    },

    header: "24h %",

    id: "h24",
  },

  {
    cell({ row }) {
      return parseFloat(
        row.original.geckoData?.data?.attributes.volume_usd.h24 ?? "0",
      ).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
    },

    header: "Volume",

    id: "volume",
  },
  {
    cell({ row }) {
      return parseFloat(
        row.original.geckoData?.data?.attributes.reserve_in_usd ?? "0",
      ).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
    },

    header: "Liquidity",

    id: "liquidity",
  },

  {
    cell({ row }) {
      return formatTokenPrice(
        parseFloat(
          row.original.geckoData?.data?.attributes.market_cap_usd ?? "0",
        ) ||
          parseFloat(row.original.geckoData?.data?.attributes.fdv_usd ?? "0"),
      );
    },

    header: "MCap",

    id: "mCap",

    sortingFn: "basic",
  },

  {
    cell({ row }) {
      return (
        (row.original.geckoData?.data?.attributes.transactions.h24.buys ?? 0) +
        (row.original.geckoData?.data?.attributes.transactions.h24.sells ?? 0)
      ).toLocaleString();
    },

    header: "Txns",

    id: "txns",

    sortingFn: "basic",
  },

  {
    cell({ row }) {
      return computeTokenAge(
        row.original.geckoData?.data?.attributes.pool_created_at ?? "",
      );
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
