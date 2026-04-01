import { ConnectWalletButton } from "./components/button";

export function TopNavBar() {
  return (
    <section className="sticky top-0 z-10 h-15 w-full">
      <div className="flex size-full items-center justify-between px-5">
        <aside>
          <h1 className="text-xl font-bold">Logo</h1>
        </aside>

        <ConnectWalletButton />
      </div>
    </section>
  );
}
