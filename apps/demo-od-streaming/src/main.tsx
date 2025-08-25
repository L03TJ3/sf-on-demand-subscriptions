import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { celo } from 'viem/chains';
import { createAppKit, defaultWagmiConfig } from '@reown/appkit-wagmi';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';
import App from './App';

const projectId = 'ea6178d2a7b40ca4b91fdc2c53f98cbe';

const metadata = {
  name: 'On Demand Streaming Demo',
  description: 'Demo for wallet connection',
  url: 'http://localhost',
  icons: ['https://reown.com/favicon.ico']
};

const chains = [celo];

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata
});

createAppKit({
  chains,
  projectId,
  wagmiConfig
});

const queryClient = new QueryClient();

const rootEl = document.getElementById('root');

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <TamaguiProvider config={config}>
            <App />
          </TamaguiProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </StrictMode>
  );
}
