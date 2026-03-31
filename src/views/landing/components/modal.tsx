import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "#/components/ui/dialog.tsx";

import { useGeckoPoolData } from "../hooks";
import { displaySafeValue, formatPercentage, formatPriceToUSD, formatTokenPrice, safeNumber } from "../utils";

interface TokenDetailsModalProps {
    onClose: () => void;
    token: MergedBagsTokenWithPool;
}

const STATUS_LABELS: Record<BagsTokenInfo["status"], string> = {
    PRE_LAUNCH: "Pre-Launch",
    PRE_GRAD: "Pre-Grad",
    MIGRATING: "Migrating",
    MIGRATED: "Migrated",
};

export function TokenDetailsModal({ token, onClose }: TokenDetailsModalProps) {
    const geckoData = token.geckoData?.data;

    const { buyPercentage, buys, buyVolume, buyers, hasTrades, mode, netVolume, sellPercentage, sellVolume, sells, sellers, totalVolume } =
        useGeckoPoolData(geckoData?.attributes);

    const chartPoolAddress = token.dammV2PoolKey ?? token.dbcPoolKey ?? null;
    const noPoolData = !chartPoolAddress;
    const notIndexed = !!token.geckoData && token.geckoData.data === null;
    const loadingPoolData = !!chartPoolAddress && !token.geckoData;
    const completePoolData = !!geckoData?.attributes;

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
                        {noPoolData ? "Not yet available on GeckoTerminal" : loadingPoolData ? "Loading pool data..." : STATUS_LABELS[token.status]}
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
                                label: "Price",
                                value: displaySafeValue(safeNumber(geckoData?.attributes.base_token_price_usd), formatPriceToUSD),
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
                                label: "24 Change",
                                value: displaySafeValue(safeNumber(geckoData?.attributes?.price_change_percentage?.h24), formatPercentage),
                            },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex flex-col rounded-md bg-gray-900 p-3 text-center">
                                <span className="text-xs text-gray-400">{label}</span>
                                <span className="font-semibold">{completePoolData ? value : "—"}</span>
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
                                            count: buys,
                                            sub: mode === "FULL" ? displaySafeValue(buyVolume, formatTokenPrice) : "-",
                                        },
                                        {
                                            label: "Sells",
                                            count: sells,
                                            sub: mode === "FULL" ? displaySafeValue(sellVolume, formatTokenPrice) : "-",
                                        },
                                        {
                                            label: "Buyers",
                                            count: buyers,
                                            sub: "unique wallets",
                                        },
                                        {
                                            label: "Sellers",
                                            count: sellers,
                                            sub: "unique wallets",
                                        },
                                    ] as const
                                ).map(({ label, count, sub }) => (
                                    <div key={label} className="flex flex-col rounded-none bg-gray-900 p-3 text-center">
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
                                            Buy {buyPercentage?.toFixed(0)}% · {mode === "FULL" ? formatTokenPrice(buyVolume!) : `${buys} txns`}
                                        </span>

                                        <span className="text-red-500">
                                            Sell {sellPercentage?.toFixed(0)}% · {mode === "FULL" ? formatTokenPrice(sellVolume!) : `${sells} txns`}
                                        </span>
                                    </div>

                                    <div className="flex h-4 overflow-hidden rounded-full bg-gray-700">
                                        <div className="bg-green-500" style={{ width: `${buyPercentage}%` }} />
                                        <div className="bg-red-500" style={{ width: `${sellPercentage}%` }} />
                                    </div>

                                    {mode === "FULL" ? (
                                        <div className="text-gray-400">
                                            Net buy volume:{" "}
                                            <span className={netVolume! >= 0 ? "text-green-500" : "text-red-500"}>
                                                {displaySafeValue(netVolume, formatTokenPrice)}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-500">Net volume unavailable</div>
                                    )}
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
