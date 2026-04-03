import { cn } from "#/lib/utils.ts";

import { NAVIGATION_LINKS } from "../side-nav-bar/constants";

export function BottomNavBar() {
    return (
        <section className="bg-background/10 border-sidebar-border fixed bottom-0 z-50 h-10 w-full border-t backdrop-blur-sm lg:hidden">
            <ul className="scrollbar-none divide-sidebar-border flex items-center justify-center gap-3 divide-x overflow-auto *:shrink-0">
                {NAVIGATION_LINKS.account.map((value, index) => (
                    <BottomNavLink key={index} {...value} />
                ))}
            </ul>
        </section>
    );
}

function BottomNavLink({ label, value }: { label: string; value: AccountTabs }) {
    const isActive = false;

    return (
        <li
            onClick={() => {}}
            className={cn(
                "group text-xs transition-all duration-100 cursor-pointer py-2 px-3 relative flex items-center",
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
