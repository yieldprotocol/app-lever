import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { Network } from '@web3-react/network';
import { URLS } from '../config/chains';

export const [metaMask, hooks] = typeof window !== "undefined" && typeof window.ethereum !== 'undefined' 

    ? initializeConnector<MetaMask>((actions) => new MetaMask(actions))
    : initializeConnector<Network>(
        (actions) => new Network(actions, URLS),
        Object.keys(URLS).map((chainId) => Number(chainId))
      );

 
