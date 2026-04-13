export function computeDataMode(attributes?: GeckoPoolAttributes | null): GeckoDataMode {
    if (!attributes) return "NONE";

    if (hasVolumeSplit(attributes)) return "FULL";

    const [hasVolume, hasTransactions] = [
        Number(attributes.volume_usd?.h24 ?? 0) > 0,
        Number(attributes.transactions.h24.buys ?? 0) + Number(attributes.transactions.h24.sells ?? 0) > 0,
    ];

    if (hasVolume || hasTransactions) return "PARTIAL";

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

export function formatDexName(dexId: string): string {
    const map: Record<string, string> = {
        "meteora-damm-v2": "Meteora DAMM v2",
        "meteora-damm": "Meteora DAMM",
        raydium: "Raydium",
        "raydium-clmm": "Raydium CLMM",
        orca: "Orca",
        "orca-whirlpools": "Orca Whirlpools",
    };
    return map[dexId] ?? dexId;
}

export function formatPercentage(number: number): string {
    const sign = number >= 0 ? "+" : "";
    return `${sign}${number.toFixed(2)}%`;
}

export function formatPriceToUSD(price: number): string {
    if (price === 0) return "$0.00";
    if (price >= 1) return `$${price.toFixed(4)}`;
    if (price >= 0.001) return `$${price.toFixed(6)}`;
    if (price >= 0.000001) return `$${price.toFixed(8)}`;

    // e.g. 0.0000001234 → $0.0₆1234
    const str = price.toFixed(20);
    const match = str.match(/^0\.(0+)([1-9]\d*)/);
    if (!match) return `$${price.toExponential(2)}`;

    const zeroCount = match[1].length;
    const significant = match[2].slice(0, 4);
    const subscript = String(zeroCount)
        .split("")
        .map((d) => "₀₁₂₃₄₅₆₇₈₉"[parseInt(d)])
        .join("");

    return `$0.0${subscript}${significant}`;
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

export function safeNumber(value: string | null | undefined): number | null {
    if (value === undefined || value === null) return null;
    const number = parseFloat(value);
    return Number.isNaN(number) ? null : number;
}

export function shouldAlignRight(columnId: string): boolean {
    return !["token", "rank"].includes(columnId);
}
