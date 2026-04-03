import { useShallow } from "zustand/shallow";

import { useClientViewState } from "#/lib/store.ts";
import { cn } from "#/lib/utils.ts";

import { NAVIGATION_LINKS } from "./constants";

export function SideNavBar() {
    return (
        <section className="border-sidebar-border bg-background/70 fixed top-15 left-0 hidden h-[calc(100vh-3.75rem)] w-48 flex-col border-r backdrop-blur-xl lg:flex">
            <div className="flex-1 space-y-8 px-3 py-12">
                <nav className="space-y-1">
                    <h2 className="text-muted-foreground px-2 text-[.625rem] font-semibold tracking-widest uppercase">Discover</h2>
                    <ul>
                        {NAVIGATION_LINKS.discover.map((value, index) => (
                            <SideNavLink key={index} {...value} />
                        ))}
                    </ul>
                </nav>

                <nav className="space-y-1">
                    <h2 className="text-muted-foreground px-2 text-[.625rem] font-semibold tracking-widest uppercase">Account</h2>
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

function SideNavLink({ label, value }: { label: string; value: NavigationTab }) {
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
                "text-sm transition-all duration-100 cursor-pointer rounded-xl px-3 py-2.5 relative flex items-center gap-3",
                "group",
                "hover:bg-primary/10 hover:translate-x-1",
                isActive ? "bg-primary/5 text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
        >
            {isActive && <span className="bg-primary/20 absolute inset-0 -z-10 rounded-xl blur-md" />}

            <span
                className={cn(
                    "text-base transition-transform",
                    "group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground",
                )}
            >
                {/* {icon} */}
            </span>

            <span className="truncate">{label}</span>
        </li>
    );
}
