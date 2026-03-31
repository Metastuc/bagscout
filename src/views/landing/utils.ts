export function computeTokenAge(iso: string): string {
    const difference = Date.now() - new Date(iso).getTime();

    const minutes = Math.floor(difference / (1000 * 60));
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    return `${days}d`;
}

export function displaySafeValue(number: number | null, formatter: (num: number) => string): string {
    return number === null ? "—" : formatter(number);
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

export function formatTokenNumber(number: number): string {
    if (number >= 1e9) return `$${(number / 1e9).toFixed(2)}B`;
    if (number >= 1e6) return `$${(number / 1e6).toFixed(2)}M`;
    if (number >= 1e3) return `$${(number / 1e3).toFixed(2)}K`;
    return `$${number.toFixed(2)}`;
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

export function safeNumber(value: string | undefined): number | null {
    if (value === undefined || value === null) return 0;
    const number = parseFloat(value);
    return Number.isNaN(number) ? null : number;
}
