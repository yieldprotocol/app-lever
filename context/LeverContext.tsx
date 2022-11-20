import { BigNumber, Contract, ethers } from 'ethers';
import React, { ReactElement, useEffect, useReducer, useState } from 'react';

import { ERC20, ERC20Permit, FYToken } from '../contracts/types';
import { TokenType } from '../lib/types';
import { convertToW3bNumber } from '../lib/utils';
import { W3bNumber } from './InputContext';

import { ASSETS, IAssetRoot, WETH } from '../config/assets';
import { ILeverRoot, LEVERS } from '../config/levers';

import logoMap from '../config/logos';

import { CAULDRON, LADLE, contractMap, factoryContractMap} from '../config/contracts';
import { useAccount, useProvider } from 'wagmi';

export interface ILeverContextState {

  assets: Map<string, IAsset>;
  levers: Map<string, ILever>;

  selectedLever: ILever | undefined;

  shortAsset: IAsset | undefined;
  longAsset: IAsset | undefined;
  marketState: any;

}

export interface IAsset extends IAssetRoot {
  image: ReactElement | undefined;
  balance: W3bNumber;
  assetContract: ERC20 | ERC20Permit | FYToken;
}

export interface ILever extends ILeverRoot {

  investTokenContract: Contract;
  leverContract: Contract;
  oracleContract: Contract;
  poolContract: Contract;

  poolAddress: string;

  minRatio: number;
  loanToValue: number;

  bestRate: W3bNumber;
  maxBase: W3bNumber;
  maxDebt: W3bNumber;
  minDebt: W3bNumber;

  tradeImage: any;
  maturityDate: Date;

}

export interface ILeverPosition {}

const LeverContext = React.createContext<any>({});

const initState: ILeverContextState = {

  // contracts: {},
  assets: new Map(),
  levers: new Map(),

  // selectedLever: undefined,
  marketState: undefined,

  selectedLever: undefined,
  // selectedPosition: undefined,

  shortAsset: undefined,
  longAsset: undefined,
};

const leverReducer = (state: ILeverContextState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    case 'UPDATE_LEVERS':
      return {
        ...state,
        levers: new Map(state.levers.set(action.payload.id, action.payload)),
      };

    case 'UPDATE_ASSET':
      return {
        ...state,
        assets: new Map(state.assets.set(action.payload.id, action.payload)),
      };

    case 'SELECT_LEVER':
      return {
        ...state,
        selectedLever: action.payload,
      };

    case 'SELECT_LONG':
      return {
        ...state,
        longAsset: action.payload,
      };
    case 'SELECT_SHORT':
      return {
        ...state,
        shortAsset: action.payload,
      };

    default:
      return state;
  }
};

const LeverProvider = ({ children }: any) => {

  /* LOCAL STATE */
  const [leverState, updateState] = useReducer(leverReducer, initState);
  const { address:account } = useAccount();
  const provider = useProvider();

  /* Connect up asset contracts : updates on provider and account changes */
  useEffect(() => { 
    if (provider) {
      Array.from(ASSETS.values()).map(async (asset: IAssetRoot) => {
        // const signer = account && signerData ? signerData : provider;
        const assetContract = factoryContractMap.get(asset.tokenType)!.connect(asset.address, provider);

        // const _bal = account ? await assetContract.balanceOf(account) : BigNumber.from('0');
        const getBal = (asset: IAssetRoot) => {
          if (account && asset.tokenType !== TokenType.ERC1155) {
            if (asset.id !== WETH) return assetContract.balanceOf(account);
            if (asset.id === WETH) return provider.getBalance(account);
          }
          return BigNumber.from('0');
        };
        
        const balance = convertToW3bNumber(await getBal(asset), asset.decimals, 6);
        const displaySymbol = asset.displaySymbol || asset.symbol;
        const levers = Array.from(LEVERS.values());

        const isShortAsset = levers.some((s: ILeverRoot) => s.baseId === asset.id);
        const isLongAsset = levers.some((s: ILeverRoot) => s.ilkId === asset.id);

        const connectedAsset = {
          ...asset,
          image: logoMap.get(displaySymbol),
          assetContract,
          balance,
          displaySymbol,
          isShortAsset,
          isLongAsset,
        };
        updateState({ type: 'UPDATE_ASSET', payload: connectedAsset });
      });
    }
  }, [provider, account]);

  /* Connect up lever contracts updates on account change */
  useEffect(() => {
    if ( provider ) {
      /* connect up relevant contracts */
      Array.from(LEVERS.values()).map(async (lever) => {

        const leverContract = contractMap.get(lever.leverAddress).connect(lever.leverAddress, provider);

        /* Connect the investToken based on investTokenType */ 
        const investTokenContract = factoryContractMap
          .get(lever.investTokenType)!
          .connect(lever.investTokenAddress, provider);

        /* get the oracle address from the cauldron  */
        const cauldron = contractMap.get(CAULDRON).connect(CAULDRON, provider);
        const [{ oracle, ratio }, debt] = await Promise.all([
          cauldron.spotOracles(lever.baseId, lever.ilkId),
          cauldron.debt(lever.baseId, lever.ilkId),
        ]);

        /* instantiate a oracle contract */
        const oracleContract = factoryContractMap.get(TokenType.ORACLE)!.connect(oracle, provider);
        // const sawpContract = contractFactories[ORACLE].connect(oracle, provider);

        let poolContract;
        let poolAddress;

        /* if investTokenType is FYTOKEN , use the yield pool as the marketContract */
        if (lever.investTokenType === TokenType.FYTOKEN) {
          const Ladle = contractMap.get(LADLE).connect(LADLE, provider);
          poolAddress = await Ladle.pools(lever.seriesId);
          poolContract = factoryContractMap.get(TokenType.YIELD_POOL)!.connect(poolAddress, provider);
        }

        /* Collateralisation ratio and loan to vaule */
        const minRatio = parseFloat(ethers.utils.formatUnits(ratio, 6));
        const loanToValue = 1 / minRatio;

        /* Calculates the base/fyToken unit selling price */
        const bestRate = await poolContract.sellFYTokenPreview('1000000000000000000');
        const maxBaseIn = await poolContract.getBaseBalance();

        const maxDebt = ethers.utils.parseUnits(debt.max.toString(), debt.dec);
        const minDebt = ethers.utils.parseUnits(debt.min.toString(), debt.dec);

        const maturityDate = new Date( lever.maturity * 1000)

        // const balance = account ? await investTokenContract.balanceOf(account) : BigNumber.from('0');
        const connectedLever = {
          ...lever,
          investTokenContract,
          leverContract,
          oracleContract,
          poolContract,
          poolAddress,

          minRatio,
          loanToValue,
          bestRate: convertToW3bNumber(bestRate, 18, 6),

          minDebt: convertToW3bNumber(minDebt, 18, 6),
          maxDebt: convertToW3bNumber(maxDebt, 18, 6),
          maxBase: convertToW3bNumber(maxBaseIn, 18, 6),

          // seriesMaturity: 
          tradeImage: logoMap.get('CURVE'),
          maturityDate: new Date( lever.maturity * 1000),

        } as ILever;

        updateState({ type: 'UPDATE_LEVERS', payload: connectedLever });
      });
    }
  }, [ provider ]);

  /* Set the initial selected lever if there is no lever selected */
  useEffect(() => {
    !leverState.selectedLever &&
      updateState({
        type: 'SELECT_LEVER',
        payload: Array.from(leverState.levers.values())[0], // Take the first lever as default
      });
  }, [leverState.levers]);

  /* ALWAYS set the short and long assets when selected lever changes */
  useEffect(() => {
    if (leverState.selectedLever) {
      updateState({
        type: 'SELECT_LONG',
        payload: leverState.assets.get(leverState.selectedLever.ilkId),
      });
      updateState({
        type: 'SELECT_SHORT',
        payload: leverState.assets.get(leverState.selectedLever.baseId),
      });
    }
  }, [leverState.selectedLever, leverState.assets]);

  /* ACTIONS TO CHANGE CONTEXT */
  const leverActions = {
    selectShort: (asset: IAsset) => updateState({ type: 'SELECT_SHORT', payload: asset }),
    selectLong: (asset: ILever) => updateState({ type: 'SELECT_LONG', payload: asset }),
    selectLever: (lever: ILever) => updateState({ type: 'SELECT_LEVER', payload: lever }),
  };

  return <LeverContext.Provider value={[leverState as ILeverContextState, leverActions]}>{children}</LeverContext.Provider>;
};

export { LeverContext };

export default LeverProvider;
