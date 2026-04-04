import { Fragment, useState, type ChangeEvent } from "react";

import { cn } from "#/lib/utils.ts";

import { safeNumber } from "../utils";

const SOL_USD = 80.2;

export function ModalTradingPanel({ token, geckoData }: { token: MergedBagsTokenWithPool; geckoData: GeckoPoolAttributes | undefined }) {
    const [tradeState, setTradeState] = useState<TradingPanelState>(() => ({
        buyAmount: "",
        sellAmount: "",
        slippage: 1,
        tab: "buy",
    }));

    const priceUsd = safeNumber(geckoData?.base_token_price_usd) ?? 0;

    const [buyEstimate, sellEstimate] = [
        (function () {
            const sol = parseFloat(tradeState.buyAmount) || 0;
            if (!sol || !priceUsd) return null;

            const tokens = (sol * SOL_USD) / priceUsd;
            if (tokens >= 1e9) return `${(tokens / 1e9).toFixed(2)}B ${token.symbol}`;
            if (tokens >= 1e6) return `${(tokens / 1e6).toFixed(2)}M ${token.symbol}`;
            if (tokens >= 1e3) return `${(tokens / 1e3).toFixed(1)}K ${token.symbol}`;
            return `${Math.round(tokens)} ${token.symbol}`;
        })(),
        (function () {
            const tokens = parseFloat(tradeState.sellAmount) || 0;
            if (!tokens || !priceUsd) return null;
            const sol = (tokens * priceUsd) / SOL_USD;
            return `${sol.toFixed(6)} SOL`;
        })(),
    ];

    const [buyPresets, sellPresets, slippageOptions] = [
        [0.1, 0.5, 1, 5],
        [25, 50, 75, 100],
        [0.5, 1, 2, 5],
    ];

    return (
        <div className="space-y-3">
            <div className="border-border flex overflow-hidden rounded-md border">
                <button
                    onClick={() => setTradeState((state) => ({ ...state, tab: "buy" }))}
                    className={cn(
                        "flex-1 py-2 text-sm font-medium transition-colors",
                        tradeState.tab === "buy" ? "bg-green-950 text-green-400" : "text-muted-foreground hover:bg-muted",
                    )}
                >
                    ↑ Buy
                </button>
                <button
                    onClick={() => setTradeState((state) => ({ ...state, tab: "sell" }))}
                    className={cn(
                        "flex-1 py-2 text-sm font-medium transition-colors",
                        tradeState.tab === "sell" ? "bg-red-950 text-red-400" : "text-muted-foreground hover:bg-muted",
                    )}
                >
                    ↓ Sell
                </button>
            </div>

            {tradeState.tab === "buy" ? (
                <Fragment>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0.00"
                            value={tradeState.buyAmount}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                setTradeState((state) => ({ ...state, buyAmount: event.target.value }))
                            }
                            className="bg-muted border-border focus:border-border/80 w-full rounded-md border px-3 py-2.5 pr-14 text-sm font-medium outline-none"
                        />
                        <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">SOL</span>
                    </div>
                    <div className="flex gap-1.5">
                        {buyPresets.map((percent) => (
                            <button
                                key={percent}
                                onClick={() => setTradeState((state) => ({ ...state, buyAmount: String(percent) }))}
                                className="border-border text-muted-foreground hover:bg-muted hover:text-foreground flex-1 rounded-md border py-1 text-xs transition"
                            >
                                {percent} SOL
                            </button>
                        ))}
                    </div>
                </Fragment>
            ) : (
                <>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            placeholder="0.00"
                            value={tradeState.sellAmount}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                setTradeState((state) => ({ ...state, sellAmount: event.target.value }))
                            }
                            className="bg-muted border-border focus:border-border/80 w-full rounded-md border px-3 py-2.5 pr-20 text-sm font-medium outline-none"
                        />
                        <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">{token.symbol}</span>
                    </div>
                    <div className="flex gap-1.5">
                        {sellPresets.map((percent) => (
                            <button
                                key={percent}
                                onClick={() => setTradeState((state) => ({ ...state, sellAmount: String(percent) }))}
                                className="border-border text-muted-foreground hover:bg-muted hover:text-foreground flex-1 rounded-md border py-1 text-xs transition"
                            >
                                {percent}%
                            </button>
                        ))}
                    </div>
                </>
            )}

            <div className="bg-muted text-muted-foreground flex justify-between rounded-md px-3 py-2 text-xs">
                <span>You receive ≈</span>
                <span className="text-foreground font-medium">
                    {tradeState.tab === "buy" ? (buyEstimate ?? `0 ${token.symbol}`) : (sellEstimate ?? "0 SOL")}
                </span>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Slippage</span>
                <div className="flex gap-1">
                    {slippageOptions.map((percent) => (
                        <button
                            key={percent}
                            onClick={() => setTradeState((state) => ({ ...state, slippage: percent }))}
                            className={cn(
                                "rounded px-2 py-1 text-xs border transition",
                                tradeState.slippage === percent
                                    ? "border-border bg-muted text-foreground"
                                    : "border-transparent text-muted-foreground hover:border-border",
                            )}
                        >
                            {percent}%
                        </button>
                    ))}
                </div>
            </div>

            <button
                disabled
                className={cn(
                    "w-full rounded-md py-2.5 text-sm font-medium text-white opacity-50 cursor-not-allowed",
                    tradeState.tab === "buy" ? "bg-green-600" : "bg-red-600",
                )}
            >
                Connect wallet to {tradeState.tab}
            </button>
            <p className="text-muted-foreground text-center text-xs">Wallet connection coming soon</p>
        </div>
    );
}
