interface LinkItem<T extends NavigationTab = NavigationTab> {
  label: string;
  value: T;
  icon: import("@phosphor-icons/react").Icon;
}

interface NavigationLinks {
  discover: Array<LinkItem>;
  account: Array<LinkItem>;
}
