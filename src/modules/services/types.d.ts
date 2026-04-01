// ─── Merged shape stored per token ───────────────────────────────────────

interface MergedBagsTokenWithPool extends BagsTokenWithPool {
  geckoData?: {
    data: GeckoPoolData | null; // null = pool exists but not indexed on Gecko
    fetchedAt: number;
  };
}

// ─── Bags API shapes ──────────────────────────────────────────────────────

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

// ─── GeckoTerminal API shapes ─────────────────────────────────────────────

interface GeckoPoolData {
  id: string;
  type: string;
  attributes: GeckoPoolAttributes;
  relationships: GeckoRelationships;
}

interface GeckoPoolAttributes {
  // Token prices — always present when data is not null
  base_token_price_usd: string;
  base_token_price_native_currency: string;
  base_token_balance?: string;
  base_token_liquidity_usd?: string;
  quote_token_price_usd: string;
  quote_token_price_native_currency: string;
  quote_token_balance?: string;
  quote_token_liquidity_usd?: string;
  base_token_price_quote_token: string;
  quote_token_price_base_token: string;

  // Pool identity — always present
  address: string;
  name: string;
  pool_name: string;
  pool_created_at: string; // ISO date string e.g. "2026-03-30T10:02:06Z"

  // Pool config — can be null
  pool_fee_percentage: string | null;
  locked_liquidity_percentage: string | null;

  // Market data — fdv always present, mcap can be null for new/low liquidity pools
  fdv_usd: string;
  market_cap_usd: string | null;

  // Price change — always present, all "0" for new tokens with no trading history
  price_change_percentage: GeckoPriceChangePercentages;

  // Transactions — always present, all 0 for new tokens
  transactions: GeckoTransactionVolumes;

  // Volume — always present, all "0.0" for new tokens
  volume_usd: GeckoVolumeData;
  buy_volume_usd?: GeckoVolumeData;
  sell_volume_usd?: GeckoVolumeData;
  net_buy_volume_usd?: GeckoVolumeData;

  // Liquidity
  reserve_in_usd: string;

  // Bonding curve progress — only present on Bags/launchpad pools
  // NOT present on standard pools (e.g. Uniswap, mature Meteora pools)
  launchpad_details?: {
    graduation_percentage: number; // 0–100, use for progress bar
    completed: boolean;
    completed_at: string | null;
    migrated_destination_pool_address: string | null;
  };
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

// Raw response shape from the GeckoTerminal API endpoint
// distinct from what gets stored on MergedBagsTokenWithPool
interface GeckoApiResponse {
  data: GeckoPoolData | null;
  included: GeckoIncludedItem[];
}
