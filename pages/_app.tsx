import '../styles/globals.css'
import type { AppProps } from 'next/app'
import '@rainbow-me/rainbowkit/styles.css';
import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  configureChains,
  createClient,
  WagmiConfig,
  chain
} from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { Chain } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const taroChain: Chain = {
  id: 1582,
  name: 'Taro testnet',
  network: 'taro',
  nativeCurrency: {
    decimals: 18,
    name: 'Taro',
    symbol: 'gETH',
  },
  rpcUrls: {
    default: {
      http: ['https://taro-testnet.calderachain.xyz/http'],
      webSocket: ['wss://taro-testnet.calderachain.xyz/ws']
    },
  },
  testnet: false,
};

const { provider, chains } = configureChains(
  [taroChain, chain.goerli],
  [
    jsonRpcProvider({
      rpc: chain => ({ http: chain.rpcUrls?.default?.http?.[0] }),
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains} 
        theme={darkTheme({
          borderRadius: "none",
          accentColor: "black",
          accentColorForeground: "white"
      })}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>        
  )
}

export default MyApp
