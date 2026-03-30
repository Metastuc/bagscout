import { mergeBagsTokenWithPool } from "../utils/merge-bags-pool";

declare global {
    interface MergedBagsTokenWithPool extends BagsTokenWithPool {
        geckoData?: {
            data: GeckoPoolData;
            fetchedAt: number;
        };
    }

    interface BagsTokenWithPool extends BagsTokenInfo {
        dbcPoolKey?: string;
        dammV2PoolKey?: string | null;
        poolAddress?: string | null;
    }

    interface BagsPoolInfo {
        tokenMint: string;
        dbcConfigKey: string;
        dbcPoolKey: string;
        dammV2PoolKey: string;
    }

    interface BagsTokenInfo {
        name: string;
        symbol: string;
        description: string;
        image: string;
        tokenMint: string;
        status: "PRE_LAUNCH" | "PRE_GRAD" | "MIGRATING" | "MIGRATED";
        twitter: string;
        website: string;
        launchSignature: string;
        accountKeys: string[];
        numRequiredSigners: number;
        uri: string;
        dbcPoolKey: string;
        dbcConfigKey: string;
    }

    interface BagsApiResponse<T> {
        success: boolean;
        response: T[];
    }

    interface GeckoPoolData {
        id: string;
        type: string;
        attributes: GeckoPoolAttributes;
        relationships: GeckoRelationships;
    }

    interface GeckoPoolAttributes {
        base_token_price_usd: string;
        base_token_price_native_currency: string;
        base_token_balance: string;
        base_token_liquidity_usd: string;
        quote_token_price_usd: string;
        quote_token_price_native_currency: string;
        quote_token_balance: string;
        quote_token_liquidity_usd: string;
        base_token_price_quote_token: string;
        quote_token_price_base_token: string;
        address: string;
        name: string;
        pool_name: string;
        pool_fee_percentage: string;
        pool_created_at: string; // ISO date string
        fdv_usd: string;
        market_cap_usd: string;
        price_change_percentage: GeckoPriceChangePercentages;
        transactions: GeckoTransactionVolumes;
        volume_usd: GeckoVolumeData;
        net_buy_volume_usd: GeckoVolumeData;
        buy_volume_usd: GeckoVolumeData;
        sell_volume_usd: GeckoVolumeData;
        reserve_in_usd: string;
        locked_liquidity_percentage: string;
    }

    interface GeckoPriceChangePercentages {
        m5: string;
        m15: string;
        m30: string;
        h1: string;
        h6: string;
        h24: string;
    }

    interface GeckoTransactionVolumes {
        m5: GeckoTransactionCount;
        m15: GeckoTransactionCount;
        m30: GeckoTransactionCount;
        h1: GeckoTransactionCount;
        h6: GeckoTransactionCount;
        h24: GeckoTransactionCount;
    }

    interface GeckoTransactionCount {
        buys: number;
        sells: number;
        buyers: number;
        sellers: number;
    }

    interface GeckoVolumeData {
        m5: string;
        m15: string;
        m30: string;
        h1: string;
        h6: string;
        h24: string;
    }

    interface GeckoRelationships {
        base_token: GeckoRelationshipData;
        quote_token: GeckoRelationshipData;
        dex: GeckoRelationshipData;
    }

    interface GeckoRelationshipData {
        data: {
            id: string;
            type: string;
        };
    }

    interface GeckoIncludedItem {
        id: string;
        type: string;
        attributes: GeckoTokenAttributes;
    }

    interface GeckoTokenAttributes {
        address: string;
        name: string;
        symbol: string;
        decimals: number;
        image_url: string;
        coingecko_coin_id: string;
    }

    interface GeckoApiResponse {
        data: GeckoPoolData;
        included: GeckoIncludedItem[];
    }
}
export {};
