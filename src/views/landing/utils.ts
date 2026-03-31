export function computeDataMode(attributes?: GeckoPoolAttributes | null): GeckoDataMode {
    if (!attributes) return "NONE";

    if (hasVolumeSplit(attributes)) return "FULL";

    const [hasVolume, hasTransactions] = [
        Number(attributes.volume_usd?.h24 ?? 0) > 0,
        Number(attributes.transactions.h24.buys ?? 0) + Number(attributes.transactions.h24.sells ?? 0) > 0,
    ];

    if (hasVolume || hasTransactions) return "PARTIAL";
    if (hasTransactions) return "VOLUME_ONLY";

    return "NONE";
}

export function computeTokenAge(iso: string): string {
    const difference = Date.now() - new Date(iso).getTime();

    const minutes = Math.floor(difference / (1000 * 60));
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    return `${days}d`;
}

export function displaySafeValue(number: number | null, formatter: (_: number) => string): string {
    if (number == null || Number.isNaN(number)) return "—";
    return formatter(number);
}

export function formatPercentage(number: number): string {
    const sign = number >= 0 ? "+" : "";
    return `${sign}${number.toFixed(2)}%`;
}

export function formatPriceToUSD(price: number): string {
    if (price >= 1) return `$${price.toFixed(4)}`;
    if (price >= 0.001) return `$${price.toFixed(6)}`;
    if (price >= 0.000001) return `$${price.toFixed(8)}`;
    return `$${price.toExponential(2)}`;
}

export function formatTokenPrice(price: number): string {
    if (price >= 1e9) return `$${(price / 1e9).toFixed(2)}B`;
    if (price >= 1e6) return `$${(price / 1e6).toFixed(2)}M`;
    if (price >= 1e3) return `$${(price / 1e3).toFixed(2)}K`;
    return `$${price.toFixed(2)}`;
}

export function hasVolumeSplit(attributes: GeckoPoolAttributes): boolean {
    return !!attributes.buy_volume_usd && !!attributes.sell_volume_usd;
}

export function processTokenData(tokens: Array<MergedBagsTokenWithPool>, activeTab: NavigationTab) {
    return tokens
        .filter((token) => {
            switch (activeTab) {
                case "trending":
                    return (token.status === "PRE_GRAD" || token.status === "MIGRATED") && !!token.geckoData;

                case "new":
                    return token.status === "PRE_LAUNCH";

                case "top_bags":
                    return token.status === "MIGRATED" && !!token.geckoData;

                case "top_gainers":
                    return Number(token.geckoData?.data?.attributes.price_change_percentage.h24 ?? 0) > 0;

                case "top_losers":
                    return Number(token.geckoData?.data?.attributes.price_change_percentage.h24 ?? 0) < 0;

                default:
                    return true;
            }
        })
        .sort((a, b) => {
            switch (activeTab) {
                case "trending":
                    return Number(b.geckoData?.data?.attributes.volume_usd.h24 ?? 0) - Number(a.geckoData?.data?.attributes.volume_usd.h24 ?? 0);

                case "top_gainers":
                    return (
                        Number(b.geckoData?.data?.attributes.price_change_percentage.h24 ?? 0) -
                        Number(a.geckoData?.data?.attributes.price_change_percentage.h24 ?? 0)
                    );

                case "top_losers":
                    return (
                        Number(a.geckoData?.data?.attributes.price_change_percentage.h24 ?? 0) -
                        Number(b.geckoData?.data?.attributes.price_change_percentage.h24 ?? 0)
                    );

                case "top_bags":
                    return Number(b.geckoData?.data?.attributes.fdv_usd ?? 0) - Number(a.geckoData?.data?.attributes.fdv_usd ?? 0);

                default:
                    return 0;
            }
        });
}

export function safeNumber(value: string | null | undefined): number | null {
    if (value === undefined || value === null) return null;
    const number = parseFloat(value);
    return Number.isNaN(number) ? null : number;
}

export function shouldAlignRight(columnId: string): boolean {
    return !["token", "rank"].includes(columnId);
}
