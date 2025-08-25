import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { celo } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { TamaguiProvider } from "tamagui";
import config from "../tamagui.config";
import App from "./App";

const projectId = "ea6178d2a7b40ca4b91fdc2c53f98cbe";

const metadata = {
  name: "On Demand Streaming Demo",
  description: "Demo for wallet connection",
  url: "http://localhost",
  icons: ["https://reown.com/favicon.ico"],
};

const chains = [celo];
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [celo];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-color-mix": "#00BB7F",
    "--w3m-color-mix-strength": 40,
    "--w3m-accent": "#00BB7F",
  },
});

const queryClient = new QueryClient();

const rootEl = document.getElementById("root");

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <TamaguiProvider config={config} defaultTheme="dark">
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </WagmiProvider>
      </TamaguiProvider>
    </StrictMode>
  );
}
