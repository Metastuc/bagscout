import {
  Bag,
  ChartLineDown,
  ChartLineUp,
  RocketLaunch,
  Sparkle,
  Star,
  TrendUp,
} from "@phosphor-icons/react";

export const NAVIGATION_LINKS: NavigationLinks = {
  discover: [
    {
      label: "Trending",
      value: "trending",
      icon: ChartLineUp,
    },
    {
      label: "New",
      value: "new",
      icon: Sparkle,
    },
    {
      label: "Top Bags",
      value: "top_bags",
      icon: Bag,
    },
    {
      label: "Top Gainers",
      value: "top_gainers",
      icon: TrendUp,
    },
    {
      label: "Top Losers",
      value: "top_losers",
      icon: ChartLineDown,
    },
  ],

  account: [
    {
      label: "Watchlist",
      value: "watchlist",
      icon: Star,
    },
    {
      label: "Deploy",
      value: "deploy_token",
      icon: RocketLaunch,
    },
  ],
};
