type NavigationTab = "trending" | "new" | "top_bags" | "top_gainers" | "top_losers";

interface ChartConfigState {
    type: "price" | "market_cap";
    resolution: "5m" | "15m" | "1h" | "4h" | "1d" | "week";
}
