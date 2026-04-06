import { Link } from "@tanstack/react-router";

import { ConnectWalletButton } from "./components/button";

export function TopNavBar() {
    return (
        <section className="bg-background/80 sticky top-0 z-50 h-15 w-full backdrop-blur-sm">
            <div className="flex size-full items-center justify-between px-5">
                <aside>
                    <Link to="/" className="flex size-10 items-center justify-center">
                        <img src="/bagscoutpng.png" alt="Bagscout Logo" />
                    </Link>
                </aside>

                <ConnectWalletButton />

                {/* <button onClick={() => alert("world")}>hello</button> */}
            </div>
        </section>
    );
}
