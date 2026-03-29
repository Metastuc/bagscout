export function processTokenData(tokens: Array<MergedBagsTokenWithPool>, activeTab: NavigationTab) {
    return tokens
        .filter((token) => {
            switch (activeTab) {
                case "trending":
                    return (token.status === "PRE_GRAD" || token.status === "MIGRATED") && !!token.geckoData;

                case "new":
                    return token.status === "PRE_LAUNCH";

                case "top_bags":
                    return token.status === "MIGRATED" && !!token.geckoData;

                case "top_gainers":
                    return Number(token.geckoData?.attributes.price_change_percentage.h24 ?? 0) > 0;

                case "top_losers":
                    return Number(token.geckoData?.attributes.price_change_percentage.h24 ?? 0) < 0;

                default:
                    return true;
            }
        })
        .sort((a, b) => {
            switch (activeTab) {
                case "trending":
                    return Number(b.geckoData?.attributes.volume_usd.h24 ?? 0) - Number(a.geckoData?.attributes.volume_usd.h24 ?? 0);

                case "top_gainers":
                    return (
                        Number(b.geckoData?.attributes.price_change_percentage.h24 ?? 0) -
                        Number(a.geckoData?.attributes.price_change_percentage.h24 ?? 0)
                    );

                case "top_losers":
                    return (
                        Number(a.geckoData?.attributes.price_change_percentage.h24 ?? 0) -
                        Number(b.geckoData?.attributes.price_change_percentage.h24 ?? 0)
                    );

                case "top_bags":
                    return Number(b.geckoData?.attributes.fdv_usd ?? 0) - Number(a.geckoData?.attributes.fdv_usd ?? 0);

                default:
                    return 0;
            }
        });
}
