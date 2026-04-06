import { type TradeQuoteResponse } from "@bagsfm/bags-sdk";
import { useSignAndSendTransaction, useWallets } from "@privy-io/react-auth/solana";
import bs58 from "bs58";
import { useReducer } from "react";

import { createSwapTransaction, getTradeQuote } from "#/api/trade.ts";

import { computeDataMode, safeNumber } from "./utils";

const SOL_MINT = "So11111111111111111111111111111111111111112";

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

const initialSwapState: SwapState = {
    status: "idle",
    quote: null,
    txSignature: null,
    error: null,
};

function swapReducer(state: SwapState, action: SwapAction): SwapState {
    switch (action.type) {
        case "QUOTE_START":
            return { ...initialSwapState, status: "quoting" };

        case "QUOTE_SUCCESS":
            return { ...state, status: "quoted", quote: action.quote };

        case "SWAP_START":
            return { ...state, status: "swapping", error: null };

        case "SWAP_SUCCESS":
            return { ...state, status: "success", txSignature: action.signature };

        case "ERROR":
            return { ...state, status: "error", error: action.message };

        case "RESET":
            return initialSwapState;

        default:
            return state;
    }
}

export function useSwap() {
    const [state, dispatch] = useReducer(swapReducer, initialSwapState);
    const { wallets } = useWallets();
    const { signAndSendTransaction } = useSignAndSendTransaction();

    const wallet = wallets[0];

    async function fetchQuote({ amountLamports, side, slippageBps, tokenMint }: FetchQuoteParams) {
        dispatch({ type: "QUOTE_START" });

        try {
            const quote = await getTradeQuote({
                data: {
                    amount: Math.floor(amountLamports * 1e9),
                    inputMint: side === "buy" ? SOL_MINT : tokenMint,
                    outputMint: side === "buy" ? tokenMint : SOL_MINT,
                    slippageBps,
                    slippageMode: "manual",
                },
            });
            dispatch({ type: "QUOTE_SUCCESS", quote: quote as TradeQuoteResponse });
            return quote;
        } catch (error) {
            dispatch({ type: "ERROR", message: (error as Error).message });
            return null;
        }
    }

    async function swap(quote: TradeQuoteResponse) {
        if (!wallet) {
            dispatch({ type: "ERROR", message: "Wallet not connected" });
            return;
        }

        dispatch({ type: "SWAP_START" });

        try {
            const { transaction: transactionBase64 } = await createSwapTransaction({
                data: { quoteResponse: quote, userPublicKey: wallet.address },
            });

            const transactionInBytes = Uint8Array.from(atob(transactionBase64), (c) => c.charCodeAt(0));
            const { signature: signatureInBytes } = await signAndSendTransaction({ transaction: transactionInBytes, wallet });
            const signature = bs58.encode(signatureInBytes);

            dispatch({ type: "SWAP_SUCCESS", signature });
        } catch (error) {
            dispatch({ type: "ERROR", message: (error as Error).message });
        }
    }

    function reset() {
        dispatch({ type: "RESET" });
    }

    return { ...state, fetchQuote, swap, reset };
}
