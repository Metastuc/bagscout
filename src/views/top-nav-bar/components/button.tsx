import { usePrivy } from "@privy-io/react-auth";
import { Wallet } from "lucide-react";
import { Fragment, useEffect } from "react";
import { useShallow } from "zustand/shallow";

import { Button } from "#/components/ui/button.tsx";
import { useClientViewState } from "#/lib/store.ts";
import { cn } from "#/lib/utils.ts";

import { truncateAddress } from "../utils";

export function ConnectWalletButton({ className }: { className?: string }) {
    const { authenticated, login, logout, user, ready } = usePrivy();
    const { isAuthenticated, setIsAuthenticated } = useClientViewState(
        useShallow((state) => ({
            isAuthenticated: state.isAuthenticated,
            setIsAuthenticated: state.setIsAuthenticated,
        })),
    );

    useEffect(
        function () {
            if (authenticated) setIsAuthenticated(true);
            else setIsAuthenticated(false);
        },
        [authenticated, setIsAuthenticated],
    );

    return (
        <Button
            className={cn(
                "text-sm flex items-center justify-center size-10 lg:min-w-34 cursor-pointer bg-[#02d92e]/75 border border-[#02d92e]/90",
                className,
            )}
            onClick={() => (authenticated ? logout() : login())}
            disabled={!ready}
        >
            {!isAuthenticated ? (
                <Fragment>
                    <i className="flex items-center justify-center lg:hidden">
                        <Wallet size={36} strokeWidth={3} />
                    </i>
                    <span className="hidden lg:block">connect wallet</span>
                </Fragment>
            ) : (
                <div className="group relative inline-flex justify-center">
                    <span className="transition-opacity delay-1000 duration-150 group-hover:opacity-0 group-hover:delay-0 group-hover:duration-0">
                        {truncateAddress(user?.wallet?.address ?? "")}
                    </span>

                    <span className="absolute inset-0 opacity-0 transition-opacity delay-1000 duration-150 group-hover:opacity-100 group-hover:delay-0 group-hover:duration-0">
                        Disconnect
                    </span>
                </div>
            )}
        </Button>
    );
}
