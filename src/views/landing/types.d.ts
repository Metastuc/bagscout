import type { TradeQuoteResponse } from "@bagsfm/bags-sdk";

declare global {
    type GeckoDataMode = "NONE" | "PARTIAL" | "FULL";
    type SwapStatus = "idle" | "quoting" | "quoted" | "swapping" | "success" | "error";

    type SwapAction =
        | { type: "QUOTE_START" }
        | { type: "QUOTE_SUCCESS"; quote: TradeQuoteResponse }
        | { type: "SWAP_START" }
        | { type: "SWAP_SUCCESS"; signature: string }
        | { type: "ERROR"; message: string }
        | { type: "RESET" };

    type TokensPage = {
        tokens: MergedBagsTokenWithPool[];
        nextCursor?: string;
    };

    interface TradingPanelState {
        buyAmount: string;
        sellAmount: string;
        slippage: number;
        tab: "buy" | "sell";
    }

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

    interface SwapState {
        status: SwapStatus;
        quote: TradeQuoteResponse | null;
        txSignature: string | null;
        error: string | null;
    }

    interface FetchQuoteParams {
        amountLamports: number;
        side: "buy" | "sell";
        slippageBps: number;
        tokenMint: string;
    }
}
export {};
