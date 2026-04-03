import { useShallow } from "zustand/shallow";

import { useClientViewState } from "#/lib/store.ts";
import { cn } from "#/lib/utils.ts";
import { NAVIGATION_LINKS } from "#/views/side-nav-bar/constants.ts";

export function LandingNavigation() {
    return (
        <nav className="border-sidebar-border flex items-center justify-center border-b p-2 lg:hidden">
            <ul className="scrollbar-none flex items-center justify-start gap-3 overflow-auto *:shrink-0">
                {NAVIGATION_LINKS.discover.map((value, index) => (
                    <MobileNavLink key={index} {...value} />
                ))}
            </ul>
        </nav>
    );
}

function MobileNavLink({ label, value }: { label: string; value: DiscoverTabs }) {
    const { activeTab, setActiveTab } = useClientViewState(
        useShallow((state) => ({
            activeTab: state.activeTab,
            setActiveTab: state.setActiveTab,
        })),
    );
    const isActive = activeTab === value;

    return (
        <li
            onClick={() => {
                setActiveTab(value);
            }}
            className={cn(
                "group text-xs transition-all duration-100 cursor-pointer rounded-xl py-2 px-3 relative flex items-center",
                "hover:bg-primary/10 hover:translate-x-1",
                isActive ? "bg-primary/5 text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
        >
            {isActive && <span className="bg-primary/10 absolute inset-0 -z-10 rounded-full" />}

            <span
                className={cn(
                    "text-sm transition-transform",
                    "group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground",
                )}
            >
                {label}
            </span>
        </li>
    );
}
