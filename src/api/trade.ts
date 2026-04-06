import { BagsSDK, type TradeQuoteResponse } from "@bagsfm/bags-sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { SERVER_ENV } from "#/env/server-env.ts";

// interface QuoteParams {
//     amount: number;
//     inputMint: string;
//     outputMint: string;
//     slippageBps?: number;
//     slippageMode?: "auto" | "manual";
// }

// interface QuoteResponse {
//     inAmount: string;
//     minOutAmount: string;
//     outAmount: string;
//     priceImpactPct: string;
//     requestId: string;
//     routePlan: Array<RouteLeg>;
//     slippageBps: number;
//     platformFee?: PlatformFee;
// }

// export interface RouteLeg {
//     inAmount: string;
//     inputMint: string;
//     outAmount: string;
//     outputMint: string;
//     venue: string;
// }

// export interface PlatformFee {
//     amount: string;
//     feeAccount: string;
//     feeBps: number;
// }

function initBagsSDK() {
    const connection = new Connection(SERVER_ENV.SOLANA_RPC_URL);
    return { sdk: new BagsSDK(SERVER_ENV.BAGS_API_KEY, connection, "confirmed"), connection };
}

const [quoteSchema, swapSchema] = [
    z.object({
        amount: z.number().int().positive(),
        inputMint: z.string(),
        outputMint: z.string(),
        slippageBps: z.number().int().min(0).max(10000).optional(),
        slippageMode: z.enum(["auto", "manual"]).optional(),
    }),
    z.object({
        quoteResponse: z.unknown(),
        userPublicKey: z.string(),
    }),
];

export const getTradeQuote = createServerFn({ method: "POST" })
    .inputValidator(quoteSchema)
    .handler(async function ({ data }) {
        const { sdk } = initBagsSDK();
        const quote = await sdk.trade.getQuote({
            amount: data.amount,
            inputMint: new PublicKey(data.inputMint),
            outputMint: new PublicKey(data.outputMint),
            slippageBps: data.slippageBps,
            slippageMode: data.slippageMode || "auto",
        });

        return {
            inAmount: quote.inAmount,
            minOutAmount: quote.minOutAmount,
            outAmount: quote.outAmount,
            platformFee: quote.platformFee
                ? { amount: quote.platformFee.amount, feeBps: quote.platformFee.feeBps, feeAccount: quote.platformFee.feeAccount }
                : undefined,
            priceImpactPct: quote.priceImpactPct,
            requestId: quote.requestId,
            routePlan: quote.routePlan.map((leg) => ({
                venue: leg.venue,
                inputMint: leg.inputMint,
                outputMint: leg.outputMint,
                inAmount: leg.inAmount,
                outAmount: leg.outAmount,
            })),
            slippageBps: quote.slippageBps,
        };
    });

export const createSwapTransaction = createServerFn()
    .inputValidator(swapSchema)
    .handler(async function ({ data }) {
        const { sdk } = initBagsSDK();

        const response = await sdk.trade.createSwapTransaction({
            quoteResponse: data.quoteResponse as TradeQuoteResponse,
            userPublicKey: new PublicKey(data.userPublicKey),
        });
        const transactionToBase64 = Buffer.from(response.transaction.serialize()).toString("base64");

        return {
            computeUnitLimit: response.computeUnitLimit,
            lastValidBlockHeight: response.lastValidBlockHeight,
            prioritizationFeeLamports: response.prioritizationFeeLamports,
            transaction: transactionToBase64,
        };
    });
