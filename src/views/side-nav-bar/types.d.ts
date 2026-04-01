interface LinkItem<T extends NavigationTab = NavigationTab> {
  label: string;
  value: T;
}

interface NavigationLinks {
  discover: Array<LinkItem>;
  account: Array<LinkItem>;
}
