import { computeDataMode, safeNumber } from "./utils";

interface GeckoPoolDataReturn {
    buyers: number;
    buys: number;
    buyPercentage: number | null;
    buyVolume: number | null;
    hasTrades: boolean;
    mode: GeckoDataMode;
    netVolume: number | null;
    sells: number;
    sellers: number;
    sellPercentage: number | null;
    sellVolume: number | null;
}

export function useGeckoPoolData(attributes?: GeckoPoolAttributes | null): GeckoPoolDataReturn {
    const mode = computeDataMode(attributes);

    const totalVolume = safeNumber(attributes?.volume_usd?.h24) ?? 0;
    const hasTrades = totalVolume > 0;

    const [buys, sells, buyers, sellers] = [
        attributes?.transactions.h24.buys ?? 0,
        attributes?.transactions.h24.sells ?? 0,
        attributes?.transactions.h24.buyers ?? 0,
        attributes?.transactions.h24.sellers ?? 0,
    ];

    let [buyVolume, sellVolume, netVolume, buyPercentage, sellPercentage]: (number | null)[] = [null, null, null, 50, 50];

    if (mode === "FULL") {
        buyVolume = safeNumber(attributes?.buy_volume_usd?.h24) ?? 0;
        sellVolume = safeNumber(attributes?.sell_volume_usd?.h24) ?? 0;
        netVolume = safeNumber(attributes?.net_buy_volume_usd?.h24) ?? 0;

        if (totalVolume > 0) {
            buyPercentage = (buyVolume / totalVolume) * 100;
            sellPercentage = (sellVolume / totalVolume) * 100;
        }
    } else {
        const totalTransactions = buys + sells;

        if (totalTransactions > 0) {
            buyPercentage = (buys / totalTransactions) * 100;
            sellPercentage = (sells / totalTransactions) * 100;
        }
    }

    return {
        buyers,
        buys,
        buyPercentage,
        buyVolume,
        hasTrades,
        mode,
        netVolume,
        sells,
        sellers,
        sellPercentage,
        sellVolume,
    };
}
