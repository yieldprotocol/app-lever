import Ethers from '@typechain/ethers-v5';
import { getPriorityConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { Network } from '@web3-react/network';
import { useEffect, useState } from 'react';
// import { WalletConnect } from '@web3-react/walletconnect'
import { hooks as metaMaskHooks, metaMask } from '../connectors/metaMask';
import { hooks as networkHooks, network} from '../connectors/network';

// import { hooks as walletConnectHooks, walletConnect } from '../connectors/walletConnect'

const useConnector = () => {

  const { usePriorityChainId, usePriorityAccount, usePriorityENSName, usePriorityProvider, usePriorityConnector } = getPriorityConnector(
    (typeof window !== "undefined" && typeof window.ethereum !== 'undefined') ? [metaMask as MetaMask, metaMaskHooks] : [network as Network, networkHooks] 
  );
 
  const chainId = usePriorityChainId();
  const account = usePriorityAccount();
  const provider = usePriorityProvider();
  const ensName = usePriorityENSName(provider);
  const connector = usePriorityConnector();

  return { chainId, account, provider, ensName, connector  };
};

export default useConnector;
