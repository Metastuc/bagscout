type DiscoverTabs = "trending" | "new" | "top_bags" | "top_gainers" | "top_losers";
type AccountTabs = "watchlist" | "deploy_token";

interface LinkItem<T> {
    label: string;
    value: T;
}

interface NavigationLinks {
    discover: Array<LinkItem<DiscoverTabs>>;
    account: Array<LinkItem<AccountTabs>>;
}
