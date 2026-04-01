import { useShallow } from "zustand/shallow";

import { useClientViewState } from "#/lib/store.ts";
import { cn } from "#/lib/utils.ts";

import { NAVIGATION_LINKS } from "./constants";

export function SideNavBar() {
  return (
    <section className="border-sidebar-border top-0 mt-15 hidden h-[calc(100vh-3.75rem)] w-48 border-r md:fixed md:block">
      <div className="space-y-5 pt-12">
        <nav className="space-y-1">
          <h2 className="px-3 text-xs text-gray-500 uppercase">Discover</h2>
          <ul>
            {NAVIGATION_LINKS.discover.map((value, index) => (
              <SideNavLink key={index} {...value} />
            ))}
          </ul>
        </nav>

        <nav className="space-y-1">
          <h2 className="px-3 text-xs text-gray-500 uppercase">Account</h2>
          <ul>
            {NAVIGATION_LINKS.account.map((value, index) => (
              <SideNavLink key={index} {...value} />
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

function SideNavLink({
  label,
  value,
}: {
  label: string;
  value: NavigationTab;
}) {
  const { activeTab, setActiveTab, setTablePageIndex } = useClientViewState(
    useShallow((state) => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
      setTablePageIndex: state.setTablePageIndex,
    })),
  );
  const isActive = activeTab === value;

  return (
    <li
      className={cn(
        "cursor-pointer rounded-md px-3 py-2 text-sm transition-all",
        "relative",
        isActive
          ? "bg-primary/15 text-primary font-medium"
          : "text-primary hover:bg-primary/10",
      )}
      onClick={() => {
        setActiveTab(value);
        setTablePageIndex(0);
      }}
    >
      {isActive ? (
        <span className="bg-primary absolute top-0 left-0 h-full w-1 rounded-r" />
      ) : null}
      {label}
    </li>
  );
}
