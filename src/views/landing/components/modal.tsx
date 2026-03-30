import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "#/components/ui/dialog.tsx";

import { displaySafeValue, formatPercentage, formatTokenNumber, safeNumber } from "../utils";

interface TokenDetailsModalProps {
    onClose: () => void;
    token: MergedBagsTokenWithPool;
}

export function TokenDetailsModal({ token, onClose }: TokenDetailsModalProps) {
    const theme = "dark";
    const geckoData = token.geckoData?.data;

    const [chartPoolAddress, noPoolData, loadingPoolData, completePoolData] = [
        token.dammV2PoolKey ?? token.dbcPoolKey,
        !token.poolAddress,
        !!token.poolAddress && !geckoData?.attributes,
        !!geckoData?.attributes,
    ];

    const chartIframeSrc = completePoolData
        ? `https://www.geckoterminal.com/solana/pools/${chartPoolAddress}?embed=1&info=0&swaps=0&${theme}_chart=0&chart_type=price&resolution=1h&bg_color=000000`
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
                        {noPoolData ? (
                            <div className="border-muted flex h-115 items-center justify-center rounded-md border bg-black">
                                <span className="text-gray-400">Not yet indexed on GeckoTerminal</span>
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

                        {completePoolData ? (
                            <div className="text-xs text-gray-500">
                                <a href={`https://www.geckoterminal.com/solana/pools/${chartPoolAddress}`} target="_blank" rel="noreferrer">
                                    View full chart ↗
                                </a>
                            </div>
                        ) : null}
                    </section>

                    <section className="my-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                        {["Market Cap", "FDV", "Liquidity", "Locked Liq", "Pool Fee"].map((label, index) => {
                            let value = "—";
                            if (completePoolData) {
                                switch (index) {
                                    case 0:
                                        value = displaySafeValue(parseFloat(geckoData?.attributes?.market_cap_usd ?? "0"), formatTokenNumber);
                                        break;
                                    case 1:
                                        value = displaySafeValue(parseFloat(geckoData?.attributes?.fdv_usd ?? "0"), formatTokenNumber);
                                        break;
                                    case 2:
                                        value = displaySafeValue(parseFloat(geckoData?.attributes?.reserve_in_usd ?? "0"), formatTokenNumber);
                                        break;
                                    case 3:
                                        value = displaySafeValue(
                                            parseFloat(geckoData?.attributes?.locked_liquidity_percentage ?? "0"),
                                            formatPercentage,
                                        );
                                        break;
                                    case 4:
                                        value = displaySafeValue(parseFloat(geckoData?.attributes?.pool_fee_percentage ?? "0"), formatPercentage);
                                        break;
                                }
                            }
                            return (
                                <div key={label} className="rounded-md bg-gray-900 p-3 text-center">
                                    <div className="text-xs text-gray-400">{label}</div>
                                    <div className="font-semibold">{value}</div>
                                </div>
                            );
                        })}
                    </section>

                    {completePoolData ? (
                        <section className="my-4">
                            <header>
                                <h4 className="mb-2 text-sm font-semibold">Transactions · 24h</h4>
                            </header>

                            <main className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {["Buys", "Sells", "Buyers", "Sellers"].map((label, index) => {
                                    const counts = [
                                        geckoData?.attributes?.transactions.h24.buys ?? null,
                                        geckoData?.attributes?.transactions.h24.sells ?? null,
                                        geckoData?.attributes?.transactions.h24.buyers ?? null,
                                        geckoData?.attributes?.transactions.h24.sellers ?? null,
                                    ];

                                    const sub = [
                                        displaySafeValue(safeNumber(geckoData?.attributes?.buy_volume_usd?.h24), formatTokenNumber),
                                        displaySafeValue(safeNumber(geckoData?.attributes?.sell_volume_usd?.h24), formatTokenNumber),
                                        "unique wallets",
                                        "unique wallets",
                                    ];

                                    return (
                                        <div key={label} className="flex flex-col rounded-md bg-gray-900 p-3 text-center">
                                            <span className="text-xs text-gray-400">{label}</span>
                                            <span className="font-semibold">{counts[index] ?? "—"}</span>
                                            <span className="text-xs text-gray-500">{sub[index]}</span>
                                        </div>
                                    );
                                })}
                            </main>

                            {/* Buy/Sell Pressure Bar */}
                            <footer className="mt-2 flex items-center gap-2 text-xs">
                                {(() => {
                                    const buy = safeNumber(geckoData?.attributes?.buy_volume_usd?.h24) ?? 0;
                                    const sell = safeNumber(geckoData?.attributes?.sell_volume_usd?.h24) ?? 0;
                                    const total = buy + sell || 1;
                                    const buyPercentage = (buy / total) * 100;

                                    return (
                                        <div className="flex-1">
                                            <div className="flex h-4 overflow-hidden rounded-full bg-gray-700">
                                                <div className="bg-green-500" style={{ width: `${buyPercentage}%` }} />
                                                <div className="bg-red-500" style={{ width: `${100 - buyPercentage}%` }} />
                                            </div>

                                            <div className="mt-1 flex justify-between">
                                                <span className="text-green-500">
                                                    Buy {buyPercentage.toFixed(0)}% · {formatTokenNumber(buy)}
                                                </span>
                                                <span className="text-red-500">
                                                    Sell {(100 - buyPercentage).toFixed(0)}% · {formatTokenNumber(sell)}
                                                </span>
                                            </div>

                                            <div className="mt-1">
                                                Net Buy Volume:{" "}
                                                <span className={buy - sell >= 0 ? "text-green-500" : "text-red-500"}>
                                                    {displaySafeValue(safeNumber(geckoData?.attributes?.net_buy_volume_usd?.h24), formatTokenNumber)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </footer>
                        </section>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
