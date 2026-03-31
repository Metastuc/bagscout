import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "#/components/ui/dialog.tsx";

import { displaySafeValue, formatPercentage, formatTokenNumber, hasVolumeSplit, safeNumber } from "../utils";

interface TokenDetailsModalProps {
    onClose: () => void;
    token: MergedBagsTokenWithPool;
}

export function TokenDetailsModal({ token, onClose }: TokenDetailsModalProps) {
    let buyPercentage: number | undefined = undefined;
    const geckoData = token.geckoData?.data;

    const chartPoolAddress = token.dammV2PoolKey ?? token.dbcPoolKey ?? null;
    const noPoolData = !chartPoolAddress;
    const notIndexed = !!token.geckoData && token.geckoData.data === null;
    const loadingPoolData = !!chartPoolAddress && !token.geckoData;
    const completePoolData = !!geckoData?.attributes;

    const [buyVolume, sellVolume, netVolume, totalVolume] = [
        safeNumber(geckoData?.attributes.buy_volume_usd?.h24) ?? 0,
        safeNumber(geckoData?.attributes.sell_volume_usd?.h24) ?? 0,
        safeNumber(geckoData?.attributes.net_buy_volume_usd?.h24) ?? 0,
        safeNumber(geckoData?.attributes.volume_usd?.h24) ?? 0,
    ];

    const hasTrades = totalVolume > 0;

    if (hasVolumeSplit(geckoData?.attributes as GeckoPoolAttributes)) buyPercentage = (buyVolume / totalVolume) * 100;
    else {
        const [buys, sells] = [geckoData?.attributes.transactions.h24.buys ?? 0, geckoData?.attributes.transactions.h24.sells ?? 0];
        const totalTransactions = buys + sells;

        if (totalTransactions > 0) buyPercentage = (buys / totalTransactions) * 100;
    }

    const chartIframeSrc = chartPoolAddress
        ? `https://www.geckoterminal.com/solana/pools/${chartPoolAddress}?embed=1&info=0&swaps=0&dark_chart=0&chart_type=price&resolution=1h&bg_color=000000`
        : undefined;

    return (
        <Dialog open={!!token} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="h-200 sm:max-w-200">
                <DialogHeader>
                    <DialogTitle>
                        {token.symbol} - {token.name}
                    </DialogTitle>
                    <DialogDescription>
                        {noPoolData ? "Not yet available on GeckoTerminal" : loadingPoolData ? "Loading pool data..." : `Status: ${token.status}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="no-scrollbar -mx-4 max-h-[80vh] overflow-y-auto px-4">
                    <section className="my-4 space-y-2">
                        {noPoolData || notIndexed ? (
                            <div className="border-muted flex h-115 items-center justify-center rounded-md border bg-black">
                                <span className="text-gray-400">
                                    {noPoolData ? "No pool address — chart unavailable" : "Not yet indexed on GeckoTerminal"}
                                </span>
                            </div>
                        ) : (
                            <iframe
                                allow="clipboard-write"
                                allowFullScreen
                                className="border-muted min-h-115 w-full rounded-md border bg-black"
                                id="geckoterminal-embed"
                                loading="lazy"
                                src={chartIframeSrc}
                                style={{ width: "100%", height: "100%" }}
                                title="GeckoTerminal Embed"
                            />
                        )}

                        {chartPoolAddress ? (
                            <div className="text-xs text-gray-500">
                                <a href={`https://www.geckoterminal.com/solana/pools/${chartPoolAddress}`} target="_blank" rel="noreferrer">
                                    View full chart on GeckoTerminal ↗
                                </a>
                            </div>
                        ) : null}
                    </section>

                    <section className="my-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                        {[
                            {
                                label: "Market Cap",
                                value: displaySafeValue(safeNumber(geckoData?.attributes.market_cap_usd), formatTokenNumber),
                            },
                            {
                                label: "FDV",
                                value: displaySafeValue(safeNumber(geckoData?.attributes?.fdv_usd), formatTokenNumber),
                            },
                            {
                                label: "Liquidity",
                                value: displaySafeValue(safeNumber(geckoData?.attributes?.reserve_in_usd), formatTokenNumber),
                            },
                            {
                                label: "Locked Liq",
                                value: displaySafeValue(safeNumber(geckoData?.attributes?.locked_liquidity_percentage), formatPercentage),
                            },
                            {
                                label: "Pool Fee",
                                value: displaySafeValue(safeNumber(geckoData?.attributes?.pool_fee_percentage), formatPercentage),
                            },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-md bg-gray-900 p-3 text-center">
                                <div className="text-xs text-gray-400">{label}</div>
                                <div className="font-semibold">{completePoolData ? value : "—"}</div>
                            </div>
                        ))}
                    </section>

                    {completePoolData ? (
                        <section className="my-4 space-y-3">
                            <h4 className="text-sm font-semibold">Transactions · 24h</h4>

                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {(
                                    [
                                        {
                                            label: "Buys",
                                            count: geckoData.attributes.transactions.h24.buys,
                                            sub: displaySafeValue(safeNumber(geckoData.attributes.buy_volume_usd?.h24), formatTokenNumber),
                                        },
                                        {
                                            label: "Sells",
                                            count: geckoData.attributes.transactions.h24.sells,
                                            sub: displaySafeValue(safeNumber(geckoData.attributes.sell_volume_usd?.h24), formatTokenNumber),
                                        },
                                        {
                                            label: "Buyers",
                                            count: geckoData.attributes.transactions.h24.buyers,
                                            sub: "unique wallets",
                                        },
                                        {
                                            label: "Sellers",
                                            count: geckoData.attributes.transactions.h24.sellers,
                                            sub: "unique wallets",
                                        },
                                    ] as const
                                ).map(({ label, count, sub }) => (
                                    <div key={label} className="flex flex-col rounded-md bg-gray-900 p-3 text-center">
                                        <span className="text-xs text-gray-400">{label}</span>
                                        <span className="font-semibold">{count}</span>
                                        <span className="text-xs text-gray-500">{sub}</span>
                                    </div>
                                ))}
                            </div>

                            {hasTrades ? (
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-green-500">
                                            Buy {buyPercentage?.toFixed(0)}% · {formatTokenNumber(buyVolume)}
                                        </span>
                                        <span className="text-red-500">
                                            Sell {(100 - (buyPercentage ?? 0)).toFixed(0)}% · {formatTokenNumber(sellVolume)}
                                        </span>
                                    </div>

                                    <div className="flex h-4 overflow-hidden rounded-full bg-gray-700">
                                        <div className="bg-green-500 transition-all" style={{ width: `${buyPercentage ?? 0}%` }} />
                                        <div className="bg-red-500" style={{ width: `${100 - (buyPercentage ?? 0)}%` }} />
                                    </div>

                                    <div className="text-gray-400">
                                        Net buy volume:{" "}
                                        <span className={buyVolume - sellVolume >= 0 ? "text-green-500" : "text-red-500"}>
                                            {displaySafeValue(netVolume, formatTokenNumber)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">No trading activity in the last 24h</p>
                            )}
                        </section>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
