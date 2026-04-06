import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

import { CLIENT_ENV } from "#/env/client-env.ts";

export function PrivyContext({ children }: { children: React.ReactNode }) {
    console.log("Privy App ID:", CLIENT_ENV.VITE_PRIVY_APP_ID);
    console.log("Privy Client ID:", CLIENT_ENV.VITE_PRIVY_CLIENT_ID);

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
            }}
        >
            {children}
        </PrivyProvider>
    );
}
