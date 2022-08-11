import { BigNumber, Contract, ethers } from 'ethers';
import React, { useEffect, useReducer } from 'react';
import { ASSETS, IAssetRoot, WETH } from '../config/assets';
import { CAULDRON, contractFactories, LADLE, ORACLE } from '../config/contractRegister';
import { ILeverStrategyRoot, STRATEGIES } from '../config/strategies';
import { ERC20Permit, FYToken } from '../contracts/types';
import { ERC20 } from '../contracts/YieldStEthLever.sol';
import useConnector from '../hooks/useConnector';
import { AppState, GeneralTokenType } from '../lib/protocol/types';
import { convertToW3bNumber } from '../lib/utils';
import { W3bNumber } from './InputContext';

export interface ILeverContextState {
  contracts: any;
  assets: Map<string, IAsset>;
  strategies: Map<string, ILeverStrategy>;
  account?: string;
  appState: AppState;
}

export interface IAsset extends IAssetRoot {
  balance: W3bNumber;
  assetContract: ERC20 | ERC20Permit | FYToken;
}

export interface ILeverStrategy extends ILeverStrategyRoot {
  investTokenContract: Contract;
  leverContract: Contract;
  oracleContract: Contract;
  marketContract: Contract;
}

const LeverContext = React.createContext<any>({});

const initState: ILeverContextState = {
  contracts: {},
  assets: new Map(),
  strategies: new Map(),
  // selectedStrategy: undefined,
  account: undefined,
  appState: AppState.Loading,
};

const leverReducer = (state: ILeverContextState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    case 'UPDATE_STRATEGY':
      return {
        ...state,
        strategies: new Map(state.strategies.set(action.payload.id, action.payload)),
      };

    case 'UPDATE_ASSET':
      return {
        ...state,
        assets: new Map(state.assets.set(action.payload.id, action.payload)),
      };

    case 'UPDATE_CONTRACTS':
      return {
        ...state,
        contracts: action.payload,
      };

    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        account: action.payload,
      };

    case 'UPDATE_APPSTATE':
      return {
        ...state,
        appState: action.payload,
      };

    default:
      return state;
  }
};

const LeverProvider = ({ children }: any) => {
  /* LOCAL STATE */
  const [leverState, updateState] = useReducer(leverReducer, initState);
  const { chainId, account, provider, ensName } = useConnector();

  /* update account on change */
  useEffect(() => updateState({ type: 'UPDATE_ACCOUNT', payload: account }), [account]);

  /* Connect up Cauldron and Ladle contracts : updates on provider change */
  useEffect(() => {
    if (provider) {
      const Cauldron = contractFactories[CAULDRON].connect(CAULDRON, provider);
      const Ladle = contractFactories[LADLE].connect(LADLE, provider);
      updateState({ type: 'UPDATE_CONTRACTS', payload: { Cauldron, Ladle } });
    }
  }, [provider]);

  /* Connect up asset contracts : updates on provider and account changes */
  useEffect(() => {
    if (provider) {
      Array.from(ASSETS.values()).map(async (asset : IAssetRoot) => {
        const signer = account ? provider.getSigner(account) : provider;
        const assetContract = contractFactories[asset.address].connect(asset.address, signer) as ERC20;

        // const _bal = account ? await assetContract.balanceOf(account) : BigNumber.from('0');
        const getBal = (asset: IAssetRoot) => {
          if (account && asset.id !== WETH) return assetContract.balanceOf(account);
          if (account && asset.id === WETH) return provider.getBalance(account);
          return BigNumber.from('0');
        };

        const balance = convertToW3bNumber(await getBal(asset), asset.decimals, asset.displayDecimals);
        const connectedAsset = {
          ...asset,
          assetContract,
          balance,
        };
        updateState({ type: 'UPDATE_ASSET', payload: connectedAsset });
      });
    }
  }, [provider, account]);

  /* connect up strategy contracts updates on accoutn change */
  useEffect(() => {
    if (provider) {
      /* connect up relevant contracts */
      Array.from(STRATEGIES.values()).map(async (strategy) => {
        const signer = account ? provider.getSigner(account) : provider;
        const leverContract = contractFactories[strategy.leverAddress].connect(strategy.leverAddress, signer);

        /* Connect the investToken based on investTokenType */
        const investTokenContract = contractFactories[strategy.investTokenType].connect(
          strategy.investTokenAddress,
          provider
        );

        /* get the oracle address from the cauldron  */
        const cauldron = contractFactories[CAULDRON].connect(CAULDRON, provider);
        const { oracle } = await cauldron.spotOracles(strategy.baseId, strategy.ilkId);
        /* instantiate a oracle contract */
        const oracleContract = contractFactories[ORACLE].connect(oracle, provider);

        let marketContract;
        /* if investTokenType is FYTOKEN , use the yield pool as the marketContract */
        if (strategy.investTokenType === GeneralTokenType.FYTOKEN) {
          const Ladle = contractFactories[LADLE].connect(LADLE, provider);
          const poolAddr = await Ladle.pools(strategy.seriesId);
          marketContract = contractFactories[GeneralTokenType.YIELD_POOL].connect(poolAddr, provider);
        }

        // const balance = account ? await investTokenContract.balanceOf(account) : BigNumber.from('0');
        const connectedStrategy = {
          ...strategy,
          investTokenContract,
          leverContract,
          oracleContract,
          marketContract,
          // assetContract,
        };
        updateState({ type: 'UPDATE_STRATEGY', payload: connectedStrategy });
      });
    }
  }, [account, provider]);

  /* ACTIONS TO CHANGE CONTEXT  */
  const leverActions = {
    setAppState: (appState: AppState) => updateState({ type: 'UPDATE_APPSTATE', payload: appState }),
  };

  return <LeverContext.Provider value={[leverState, leverActions]}>{children}</LeverContext.Provider>;
};

export { LeverContext };

export default LeverProvider;
