import { BottomNavBar } from "#/views/bottom-nav-bar/index.tsx";
import { SideNavBar } from "#/views/side-nav-bar/index.tsx";
import { TopNavBar } from "#/views/top-nav-bar/index.tsx";

import { SlidingTokens } from "../sliding-tokens";
import { BaseLayout } from "./base";

export function ShellLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className="relative h-dvh">
            <TopNavBar />
            <SlidingTokens />
            <SideNavBar />
            <BaseLayout>{children}</BaseLayout>
            <BottomNavBar />
        </section>
    );
}
