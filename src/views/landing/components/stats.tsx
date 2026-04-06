import { cn } from "#/lib/utils.ts";

import { useGeckoPoolData } from "../hooks";
import { computeTokenAge, displaySafeValue, formatDexName, formatPercentage, formatPriceToUSD, formatTokenPrice, safeNumber } from "../utils";
import { CopyButton } from "./copy";

interface StatisticsPanelProps {
    token: MergedBagsTokenWithPool;
    geckoData: GeckoPoolData | null | undefined;
    completePoolData: boolean;
}

export function StatisticsPanel({ token, geckoData, completePoolData }: StatisticsPanelProps) {
    const { buyPercentage, buyVolume, buyers, buys, hasTrades, mode, netVolume, sellPercentage, sellVolume, sellers, sells } = useGeckoPoolData(
        geckoData?.attributes,
    );

    const priceChange = safeNumber(geckoData?.attributes?.price_change_percentage?.h24);
    const lockedLiquidity = safeNumber(geckoData?.attributes?.locked_liquidity_percentage);
    const dexId = geckoData?.relationships?.dex?.data?.id;
    const age = geckoData?.attributes?.pool_created_at ? computeTokenAge(geckoData?.attributes.pool_created_at) : null;
    const priceInSol = safeNumber(geckoData?.attributes?.base_token_price_native_currency);

    return (
        <section className="space-y-4">
            <div className="space-y-1">
                <span className="text-muted-foreground text-xs">Contract</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-foreground truncate font-mono text-xs">
                        {token.tokenMint.slice(0, 4)}...{token.tokenMint.slice(-4)}
                    </span>
                    <CopyButton text={token.tokenMint} />
                </div>
            </div>

            {token.twitter || token.website ? (
                <div className="flex gap-2">
                    {token.twitter ? (
                        <a
                            href={token.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground border-border rounded border px-2 py-1 text-xs transition duration-100"
                        >
                            Twitter ↗
                        </a>
                    ) : null}

                    {token.website ? (
                        <a
                            href={token.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground border-border rounded border px-2 py-1 text-xs transition duration-100"
                        >
                            Website ↗
                        </a>
                    ) : null}
                </div>
            ) : null}

            <div className="space-y-0">
                {[
                    {
                        label: "Price USD",
                        value: displaySafeValue(safeNumber(geckoData?.attributes?.base_token_price_usd), formatPriceToUSD),
                    },
                    {
                        label: "Price SOL",
                        value: priceInSol != null ? `◎${priceInSol.toExponential(4)}` : "—",
                    },
                    {
                        label: "FDV",
                        value: displaySafeValue(safeNumber(geckoData?.attributes?.fdv_usd), formatTokenPrice),
                    },
                    {
                        label: "Liquidity",
                        value: displaySafeValue(safeNumber(geckoData?.attributes?.reserve_in_usd), formatTokenPrice),
                    },
                    {
                        label: "Volume 24h",
                        value: displaySafeValue(safeNumber(geckoData?.attributes?.volume_usd?.h24), formatTokenPrice),
                    },
                    {
                        label: "24h Change",
                        value: displaySafeValue(priceChange, formatPercentage),
                        colored: true,
                        positive: (priceChange ?? 0) >= 0,
                    },
                    ...(lockedLiquidity != null ? [{ label: "Locked liq.", value: `${lockedLiquidity.toFixed(0)}%` }] : []),
                    ...(age != null ? [{ label: "Age", value: age }] : []),
                    ...(dexId != null ? [{ label: "DEX", value: formatDexName(dexId) }] : []),
                ].map(({ label, value, colored, positive }) => (
                    <div key={label} className="border-border/40 flex items-center justify-between border-b py-1.5 last:border-0">
                        <span className="text-muted-foreground text-xs">{label}</span>
                        <span className={cn("text-xs font-medium", colored && positive && "text-green-400", colored && !positive && "text-red-400")}>
                            {completePoolData ? value : "—"}
                        </span>
                    </div>
                ))}
            </div>

            {completePoolData ? (
                <div className="space-y-3">
                    <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Transactions · 24h</h4>

                    <div className="grid grid-cols-2 gap-2">
                        {(
                            [
                                { label: "Buys", count: buys, sub: mode === "FULL" ? displaySafeValue(buyVolume, formatTokenPrice) : "-" },
                                { label: "Sells", count: sells, sub: mode === "FULL" ? displaySafeValue(sellVolume, formatTokenPrice) : "-" },
                                { label: "Buyers", count: buyers, sub: "unique" },
                                { label: "Sellers", count: sellers, sub: "unique" },
                            ] as const
                        ).map(({ label, count, sub }) => (
                            <div key={label} className="bg-muted flex flex-col rounded-xs p-2.5 text-center">
                                <span className="text-muted-foreground text-xs">{label}</span>
                                <span className="text-sm font-semibold">{count}</span>
                                <span className="text-muted-foreground text-xs">{sub}</span>
                            </div>
                        ))}
                    </div>

                    {hasTrades ? (
                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-green-400">
                                    Buy {buyPercentage?.toFixed(0)}%
                                    <span className="lg:hidden"> · {mode === "FULL" ? formatTokenPrice(buyVolume!) : `${buys} txns`}</span>
                                </span>

                                <span className="text-red-400">
                                    Sell {sellPercentage?.toFixed(0)}%
                                    <span className="lg:hidden"> · {mode === "FULL" ? formatTokenPrice(sellVolume!) : `${sells} txns`}</span>
                                </span>
                            </div>

                            <div className="bg-muted flex h-2 overflow-hidden rounded-full">
                                <div className="bg-green-500 transition-all" style={{ width: `${buyPercentage}%` }} />
                                <div className="bg-red-500 transition-all" style={{ width: `${sellPercentage}%` }} />
                            </div>

                            {mode === "FULL" ? (
                                <p className="text-muted-foreground">
                                    Net buy volume:{" "}
                                    <span className={netVolume! >= 0 ? "text-green-400" : "text-red-400"}>
                                        {displaySafeValue(netVolume, formatTokenPrice)}
                                    </span>
                                </p>
                            ) : (
                                <p className="text-muted-foreground">Net volume unavailable</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-xs">No trading activity in the last 24h</p>
                    )}
                </div>
            ) : null}
        </section>
    );
}
