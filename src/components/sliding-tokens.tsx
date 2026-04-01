import { useNavigate } from "@tanstack/react-router";

import { useClientViewState } from "#/lib/store.ts";
import { cn } from "#/lib/utils.ts";
import { formatPercentage, formatPriceToUSD } from "#/views/landing/utils.ts";

export function SlidingTokens() {
    const tickerTokens = useClientViewState((state) => state.tickerTokens);

    return (
        <section className="border-sidebar-border sticky top-15 z-10 h-8.5 w-full overflow-hidden border-y bg-black py-2">
            <ul className="hover:paused divide-sidebar-border flex w-max animate-[scroll_180s_linear_infinite] divide-x">
                {[...tickerTokens, ...tickerTokens].map((value, index) => (
                    <Token key={index} value={value} />
                ))}
            </ul>
        </section>
    );
}

function Token({ value }: { value?: MergedBagsTokenWithPool }) {
    const navigate = useNavigate({ from: "/" });
    const percentChange = parseFloat(value?.geckoData?.data?.attributes.price_change_percentage.h24 ?? "0");

    if (!value) return null;

    return (
        <li
            className="hover:bg-accent/40 flex h-4 min-w-32 cursor-pointer items-center justify-center px-4"
            onClick={() => navigate({ search: { token: value.tokenMint } })}
        >
            <article className="flex items-center gap-2 text-xs">
                <span className="text-accent-foreground font-bold">{value?.symbol}</span>
                <span className="text-accent text-sm">
                    {formatPriceToUSD(parseFloat(value?.geckoData?.data?.attributes.base_token_price_usd ?? "0"))}
                </span>
                <span className={cn(percentChange >= 0 ? "text-green-500" : "text-red-500")}>{formatPercentage(percentChange)}</span>
            </article>
        </li>
    );
}
