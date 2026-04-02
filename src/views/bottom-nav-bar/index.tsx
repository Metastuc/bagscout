import { type Icon } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";

import { useClientViewState } from "#/lib/store.ts";
import { cn } from "#/lib/utils.ts";

import { NAVIGATION_LINKS } from "../side-nav-bar/constants";

export function BottomNavBar() {
  const allLinks = [
    ...NAVIGATION_LINKS.discover,
    ...NAVIGATION_LINKS.account,
  ];

  return (
    <nav className="border-border bg-background/80 fixed bottom-0 z-10 w-full border-t backdrop-blur-xl sm:hidden">
      <ul className="scrollbar-none flex items-center overflow-x-auto">
        {allLinks.map((link) => (
          <BottomNavLink key={link.value} {...link} />
        ))}
      </ul>
    </nav>
  );
}

function BottomNavLink({
  label,
  value,
  icon: NavIcon,
}: {
  label: string;
  value: NavigationTab;
  icon: Icon;
}) {
  const { activeTab, setActiveTab } = useClientViewState(
    useShallow((state) => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
    })),
  );
  const isActive = activeTab === value;

  return (
    <li
      onClick={() => setActiveTab(value)}
      className={cn(
        "flex min-w-16 flex-1 cursor-pointer flex-col items-center gap-1 px-3 py-3 transition-colors",
        isActive ? "text-primary-foreground" : "text-muted-foreground",
      )}
    >
      <NavIcon size={20} weight={isActive ? "fill" : "regular"} />
      <span className="text-[0.625rem] font-medium leading-none tracking-wide whitespace-nowrap">
        {label}
      </span>
    </li>
  );
}
