import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

import { CLIENT_ENV } from "#/env/client-env.ts";

export function PrivyContext({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={CLIENT_ENV.VITE_PRIVY_APP_ID}
            clientId={CLIENT_ENV.VITE_PRIVY_CLIENT_ID}
            config={{
                appearance: { walletChainType: "solana-only", theme: "dark", accentColor: "#016630" },
                embeddedWallets: {
                    solana: {
                        createOnLogin: "users-without-wallets",
                    },
                },
                externalWallets: {
                    solana: {
                        connectors: toSolanaWalletConnectors(),
                    },
                },
                solana: {
                    rpcs: {
                        "solana:mainnet": {
                            rpc: createSolanaRpc(CLIENT_ENV.VITE_SOLANA_RPC_URL),
                            rpcSubscriptions: createSolanaRpcSubscriptions(CLIENT_ENV.VITE_SOLANA_RPC_URL.replace("https", "wss")),
                        },
                    },
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}
