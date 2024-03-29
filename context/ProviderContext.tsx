import { mainnet, WagmiConfig, createClient, configureChains } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { ReactNode} from 'react';
import {
  darkTheme,
  RainbowKitProvider,
  DisclaimerComponent,
  connectorsForWallets,
  Theme,
  AvatarComponent,
  lightTheme,
} from '@rainbow-me/rainbowkit';

import {
metaMaskWallet,
walletConnectWallet,
injectedWallet, 
coinbaseWallet,
rainbowWallet,
ledgerWallet,
argentWallet,
braveWallet
} from '@rainbow-me/rainbowkit/wallets';

import '@rainbow-me/rainbowkit/styles.css';
import YieldAvatar from '../components/YieldAvatar';

const ProviderContext = ({ children }: { children: ReactNode }) => {
  /* bring in all the settings in case we want to use them settings up the netwrok */
  // const { settingsState } = useContext(SettingsContext);

  // Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
  const { chains, provider } = configureChains(
    [mainnet], // [chain.mainnet, chain.arbitrum, chain.localhost, chain.foundry],
    [
      jsonRpcProvider({
        rpc: (chain_) => ({
          http: process.env.FORKED_ENV_RPC || '',
        }),
      }),
      // alchemyProvider({
      //   apiKey: process.env.ALCHEMY_MAINNET_KEY||'',
      // }),
    ]
  );

  const connectors = connectorsForWallets([
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet({ chains }), walletConnectWallet({ chains }), injectedWallet({ chains })],
    },
    {
      groupName: 'Experimental',
      wallets: [
        coinbaseWallet({ appName: 'yieldProtocol', chains }),
        rainbowWallet({ chains }),
        ledgerWallet({ chains }),
        argentWallet({ chains }),
        braveWallet({ chains }),
      ],
    },
    {
      groupName: 'Test environments',
      wallets: [],
    },
  ]);

  // Set up client
  const client = createClient({
    autoConnect: true,
    connectors,
    provider,
  });

  const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
    <Text>
      By connecting my wallet, I agree to the <Link href="https://yieldprotocol.com/terms/">Terms of Service</Link> and
      acknowledge I have read and understand the protocol{' '}
      <Link href="https://yieldprotocol.com/privacy/">Privacy Policy</Link>.
    </Text>
  );

  const CustomAvatar: AvatarComponent = ({ address }) => <YieldAvatar address={address} size={2} noBorder />;

  return (
    <WagmiConfig client={client}>
      <RainbowKitProvider
        appInfo={{
          appName: 'Yield Protocol',
          disclaimer: Disclaimer,
        }}
        chains={chains}
        showRecentTransactions={true}
        modalSize="compact"
        coolMode
        avatar={CustomAvatar}
        theme= {myDarkTheme} // { colorTheme === 'dark' ? myDarkTheme : myLightTheme }
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default ProviderContext;

const myDarkTheme: Theme = {
  ...darkTheme(),
  colors : {
    ...darkTheme().colors,
    modalBackdrop: 'rgb(1, 1, 1, .85)'
  },
  radii: {
    actionButton: '...',
    connectButton: '...',
    menuButton: '...',
    modal: '8px',
    modalMobile: '...',
  },
};

const myLightTheme: Theme = {
  ...lightTheme(),
  colors : {
    ...lightTheme().colors,
    modalBackdrop: 'rgb(1, 1, 1, .50)'
  },
  radii: {
    actionButton: '...',
    connectButton: '...',
    menuButton: '...',
    modal: '8px',
    modalMobile: '...',
  },
};