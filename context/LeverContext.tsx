import { BigNumber, Contract, ethers } from 'ethers';
import React, { useEffect, useReducer } from 'react';
import { ASSETS, IAssetRoot, WETH } from '../config/assets';
import { CAULDRON, contractFactories, LADLE, ORACLE } from '../config/contractRegister';
import { ILeverStrategyRoot, STRATEGIES } from '../config/strategies';
import { ERC20, ERC20Permit, FYToken } from '../contracts/types';
import useConnector from '../hooks/useConnector';
import { AppState, TokenType } from '../lib/types';
import { convertToW3bNumber } from '../lib/utils';
import { W3bNumber } from './InputContext';

import logoMap from '../config/logos';
import { sellFYToken } from '@yield-protocol/ui-math';

export interface ILeverContextState {
  contracts: any;
  assets: Map<string, IAsset>;

  strategies: Map<string, ILeverStrategy>;

  appState: AppState;

  selectedStrategy: ILeverStrategy | undefined;
  selectedPosition: ILeverStrategy | undefined;

  shortAsset: IAsset | undefined;
  longAsset: IAsset | undefined;

  marketState: any;
  provider: any;

  account?: string;
}

export interface IAsset extends IAssetRoot {
  balance: W3bNumber;
  assetContract: ERC20 | ERC20Permit | FYToken;
}

export interface ILeverStrategy extends ILeverStrategyRoot {
  investTokenContract: Contract;
  leverContract: Contract;
  oracleContract: Contract;
  poolContract: Contract;
  poolAddress: string;

  minRatio: number;
  loanToValue: number;

  bestRate: W3bNumber;
  maxBase: W3bNumber;
}

const LeverContext = React.createContext<any>({});

const initState: ILeverContextState = {
  appState: AppState.Loading,

  contracts: {},
  assets: new Map(),
  strategies: new Map(),

  // selectedStrategy: undefined,
  account: undefined,

  marketState: undefined,

  selectedStrategy: undefined,
  selectedPosition: undefined,

  shortAsset: undefined,
  longAsset: undefined,

  provider: undefined,
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

    case 'SELECT_STRATEGY':
      return {
        ...state,
        selectedStrategy: action.payload,
      };

    case 'SELECT_POSITION':
      return {
        ...state,
        selectedPosition: action.payload,
      };

    case 'UPDATE_PROVIDER':
      return {
        ...state,
        provider: action.payload,
      };

    case 'UPDATE_LONG_SHORT':
      return {
        ...state,
        shortAsset: action.payload.shortAsset,
        longAsset: action.payload.longAsset,
      };

    default:
      return state;
  }
};

const LeverProvider = ({ children }: any) => {
  /* LOCAL STATE */
  const [leverState, updateState] = useReducer(leverReducer, initState);
  const { account, provider } = useConnector();

  /* update account on change */
  useEffect(() => {
    console.log(account, ' connected.');
    updateState({ type: 'UPDATE_ACCOUNT', payload: account });
  }, [account]);

  /* update account on change */
  useEffect(() => updateState({ type: 'UPDATE_PROVIDER', payload: provider }), [provider]);

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
      Array.from(ASSETS.values()).map(async (asset: IAssetRoot) => {
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
          image: logoMap.get(asset.symbol),
          assetContract,
          balance,
        };
        updateState({ type: 'UPDATE_ASSET', payload: connectedAsset });
      });
    }
  }, [provider, account]);

  /* Connect up strategy contracts updates on account change */
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
        const [{ oracle, ratio }, debt] = await Promise.all([
          cauldron.spotOracles(strategy.baseId, strategy.ilkId),
          cauldron.debt(strategy.baseId, strategy.ilkId),
        ]);

        /* instantiate a oracle contract */
        const oracleContract = contractFactories[ORACLE].connect(oracle, provider);
        // const sawpContract = contractFactories[ORACLE].connect(oracle, provider);

        let poolContract;
        let poolAddress;

        /* if investTokenType is FYTOKEN , use the yield pool as the marketContract */
        if (strategy.investTokenType === TokenType.FYTOKEN) {
          const Ladle = contractFactories[LADLE].connect(LADLE, provider);
          poolAddress = await Ladle.pools(strategy.seriesId);
          poolContract = contractFactories[TokenType.YIELD_POOL].connect(poolAddress, provider);
        }

        /* Collateralisation ratio and loan to vaule */
        const minRatio = parseFloat(ethers.utils.formatUnits(ratio, 6));
        const loanToValue = 1 / minRatio;

        /* Calculates the base/fyToken unit selling price */
        const bestRate = await poolContract.sellFYTokenPreview('1000000000000000000');
        const maxBase = await poolContract.getBaseBalance()

        // const balance = account ? await investTokenContract.balanceOf(account) : BigNumber.from('0');
        const connectedStrategy = {
          ...strategy,
          investTokenContract,
          leverContract,
          oracleContract,
          poolContract,
          poolAddress,

          minRatio,
          loanToValue,
          bestRate: convertToW3bNumber(bestRate, 18, 6),
          maxBase: convertToW3bNumber(maxBase, 18, 6)
        };

        updateState({ type: 'UPDATE_STRATEGY', payload: connectedStrategy });
      });
    }
  }, [account, provider]);

  /* Set the initial selected Strategy if there is no strategy seelcted */
  useEffect(() => {
    !leverState.selectedStrategy &&
      updateState({
        type: 'SELECT_STRATEGY',
        payload: Array.from(leverState.strategies.values())[0], // Take the first strategy as default
      });
  }, [leverState.strategies]);

  /* set the short and long assets when selected strategy changes */
  useEffect(() => {
    leverState.selectedStrategy &&
      updateState({
        type: 'UPDATE_LONG_SHORT',
        payload: {
          shortAsset: leverState.assets.get(leverState.selectedStrategy.baseId),
          longAsset: leverState.assets.get(leverState.selectedStrategy.ilkId),
        },
      });
  }, [leverState.selectedStrategy, leverState.assets]);

  /* ACTIONS TO CHANGE CONTEXT  */
  const leverActions = {
    selectStrategy: (strategy: ILeverStrategy) => updateState({ type: 'SELECT_STRATEGY', payload: strategy }),
    selectPosition: (position: ILeverStrategy) => updateState({ type: 'SELECT_POSITION', payload: position }),
    setAppState: (appState: AppState) => updateState({ type: 'UPDATE_APPSTATE', payload: appState }),
  };

  return <LeverContext.Provider value={[leverState, leverActions]}>{children}</LeverContext.Provider>;
};

export { LeverContext };

export default LeverProvider;
