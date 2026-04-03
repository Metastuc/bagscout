import { Wallet } from "lucide-react";

import { Button } from "#/components/ui/button.tsx";
import { cn } from "#/lib/utils.ts";

export function ConnectWalletButton({ className }: { className?: string }) {
    return (
        <Button className={cn("text-sm flex items-center justify-center", className)}>
            <i className="size-5 items-center justify-center lg:hidden">
                <Wallet className="size-full" />
            </i>
            <span className="hidden lg:block">connect wallet</span>
        </Button>
    );
}
