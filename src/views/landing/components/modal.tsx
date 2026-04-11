import { SafeImage } from "#/components/safe-image.tsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "#/components/ui/dialog.tsx";

import { GeckoTokenChart } from "./chart";
import { StatisticsPanel } from "./statistics";
import { StatusTag } from "./status";

interface TokenDetailsModalProps {
    onClose: () => void;
    token: MergedBagsTokenWithPool;
}

export function TokenDetailsModal({ token, onClose }: TokenDetailsModalProps) {
    const geckoData = token.geckoData?.data;

    const chartPoolAddress = token.dammV2PoolKey ?? token.dbcPoolKey ?? null;
    const noPoolData = !chartPoolAddress;
    const loadingPoolData = !!chartPoolAddress && !token.geckoData;
    const completePoolData = !!geckoData?.attributes;

    return (
        <Dialog open={!!token} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="h-[calc(100dvh-4rem)] max-w-[calc(100dvw-2rem)] sm:max-w-[calc(100dvw-2rem)] lg:h-auto lg:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>
                        <div className="flex items-center gap-3">
                            <SafeImage alt={token.name} src={token.image} symbol={token.symbol} />
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold">{token.symbol}</span>
                                <span className="text-muted-foreground text-xs">{token.name}</span>
                            </div>
                        </div>
                    </DialogTitle>

                    <DialogDescription>
                        {noPoolData ? (
                            "Not yet available on GeckoTerminal"
                        ) : loadingPoolData ? (
                            "Loading pool data..."
                        ) : (
                            <StatusTag status={token.status} />
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="lg:no-scrollbar overflow-y-auto">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_14rem]">
                        <GeckoTokenChart geckoData={geckoData} token={token} />

                        <div className="lg:border-border lg:border-l lg:pl-6">
                            <StatisticsPanel token={token} geckoData={geckoData} completePoolData={completePoolData} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
