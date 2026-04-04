import { ModalTradingPanel } from "./trading";

interface GeckoTokenChartProps {
    token: MergedBagsTokenWithPool;
    geckoData: GeckoPoolData | null | undefined;
}

export function GeckoTokenChart({ token, geckoData }: GeckoTokenChartProps) {
    const chartPoolAddress = token.dammV2PoolKey ?? token.dbcPoolKey ?? null;
    const noPoolData = !chartPoolAddress;
    const notIndexed = !!token.geckoData && token.geckoData.data === null;
    const chartIframeSrc = chartPoolAddress
        ? `https://www.geckoterminal.com/solana/pools/${chartPoolAddress}?embed=1&info=0&swaps=0&dark_chart=0&chart_type=price&resolution=1h&bg_color=000000`
        : undefined;

    return (
        <section className="space-y-4">
            <div className="aspect-square lg:aspect-video">
                {noPoolData || notIndexed ? (
                    <div className="border-muted flex size-full items-center justify-center rounded-md border bg-black">
                        <span className="text-gray-400">
                            {noPoolData ? "No pool address — chart unavailable" : "Not yet indexed on GeckoTerminal"}
                        </span>
                    </div>
                ) : (
                    <iframe
                        allow="clipboard-write"
                        allowFullScreen
                        className="border-muted size-full rounded-md border bg-black"
                        id="geckoterminal-embed"
                        loading="lazy"
                        src={chartIframeSrc}
                        title="GeckoTerminal Embed"
                    />
                )}
            </div>

            {chartPoolAddress ? (
                <div className="text-xs text-gray-500">
                    <a href={`https://www.geckoterminal.com/solana/pools/${chartPoolAddress}`} target="_blank" rel="noreferrer">
                        View full chart on GeckoTerminal ↗
                    </a>
                </div>
            ) : null}

            <ModalTradingPanel token={token} geckoData={geckoData?.attributes} />
        </section>
    );
}
