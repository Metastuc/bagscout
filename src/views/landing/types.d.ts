type GeckoDataMode = "NONE" | "PARTIAL" | "FULL";

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
