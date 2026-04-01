import { Link } from "@tanstack/react-router";

import { ConnectWalletButton } from "./components/button";

export function TopNavBar() {
  return (
    <section className="sticky top-0 z-10 h-15 w-full">
      <div className="flex size-full items-center justify-between px-5">
        <aside>
          <Link to="/" className="flex size-10 items-center justify-center">
            <img src="/bagscoutpng.png" alt="Bagscout Logo" />
          </Link>
        </aside>

        <ConnectWalletButton />
      </div>
    </section>
  );
}
