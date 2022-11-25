import { BigNumber, Contract, ethers } from 'ethers';
import React, { ReactElement, useEffect, useReducer } from 'react';

import { ERC20, ERC20Permit, FYToken } from '../contracts/types';
import { TokenType, W3bNumber } from '../lib/types';
import { convertToW3bNumber } from '../lib/utils';
import { ASSETS, IAssetRoot, WETH } from '../config/assets';
import { ILeverRoot, LEVERS } from '../config/levers';

import { CAULDRON, LADLE, contractMap } from '../config/contracts';
import { useAccount, useProvider } from 'wagmi';

import logoMap from '../config/logos';

export interface ILeverContextState {
  assets: Map<string, IAsset>;
  levers: Map<string, ILever>;

  selectedLever: ILever | undefined;

  selectedShortAsset: IAsset | undefined;
  selectedLongAsset: IAsset | undefined;
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
  assets: new Map<string, IAsset>(),
  levers: new Map<string, ILever>(),

  selectedLever: undefined,

  selectedShortAsset: undefined,
  selectedLongAsset: undefined,
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

    case 'SELECT_ASSET':
      return {
        ...state,
        selectedLongAsset: action.payload.longAsset,
        selectedShortAsset: action.payload.shortAsset,
      };

    case 'SELECT_LONG':
      return {
        ...state,
        selectedLongAsset: action.payload,
      };

    case 'SELECT_SHORT':
      return {
        ...state,
        selectedShortAsset: action.payload,
      };

    default:
      return state;
  }
};

const LeverProvider = ({ children }: any) => {
  /* LOCAL STATE */
  const [leverState, updateState] = useReducer(leverReducer, initState);
  const { address: account } = useAccount();
  const provider = useProvider();

  /* Connect up asset contracts : updates on provider and account changes */
  useEffect(() => {
    if (provider) {
      Array.from(ASSETS.values()).map(async (asset: IAssetRoot) => {
        const assetContract = contractMap.get(asset.tokenType)!.connect(asset.address, provider);
        const getBal = (asset: IAssetRoot) => {
          if (account && asset.tokenType !== TokenType.ERC1155) {
            if (asset.id !== WETH) return assetContract.balanceOf(account);
            if (asset.id === WETH) return provider.getBalance(account);
          }
          return BigNumber.from('0');
        };

        const balance = convertToW3bNumber(await getBal(asset), asset.decimals, 6);
        
        const levers = Array.from(LEVERS.values());
        // const isBaseAsset = levers.some((s: ILeverRoot) => s.baseId === asset.id);
        const isBaseAsset = asset.isBaseAsset;
        const isLongAsset = levers.some((s: ILeverRoot) => s.ilkId === asset.id);

        const displaySymbol = asset.displaySymbol || asset.symbol;
        const assetImage = logoMap.get(asset.imageId! || asset.symbol)

        const connectedAsset = {
          ...asset,
          image: assetImage,
          assetContract,
          balance,
          displaySymbol,
          isBaseAsset,
          isLongAsset,
        };

        updateState({ type: 'UPDATE_ASSET', payload: connectedAsset });
      });
    }
  }, [provider, account]);

  /* Connect up lever contracts updates on account change */
  useEffect(() => {
    if (provider) {
      /* connect up relevant contracts */
      Array.from(LEVERS.values()).map(async (lever) => {
        /* Attatch the lever contract */
        const leverContract = contractMap.get(lever.leverAddress).connect(lever.leverAddress, provider);
        /* Get the base asset info */
        const { decimals, displayDigits } = ASSETS.get(lever.baseId) as IAssetRoot;

        /* Connect the investToken based on investTokenType */
        const investTokenContract = contractMap.get(lever.investTokenType)!.connect(lever.investTokenAddress, provider);

        /* Get the oracle address and debt (min/max) from the cauldron  */
        const cauldron = contractMap.get(CAULDRON).connect(CAULDRON, provider);
        const [{ oracle, ratio }, debt] = await Promise.all([
          cauldron.spotOracles(lever.baseId, lever.ilkId),
          cauldron.debt(lever.baseId, lever.ilkId),
        ]);

        /* Instantiate a oracle contract */
        const oracleContract = contractMap.get(TokenType.ORACLE)!.connect(oracle, provider);

        /* if investTokenType is FYTOKEN , use the yield pool as the marketContract */
        let poolContract;
        let poolAddress;
        if (lever.investTokenType === TokenType.FYTOKEN) {
          const Ladle = contractMap.get(LADLE).connect(LADLE, provider);
          poolAddress = await Ladle.pools(lever.seriesId);
          poolContract = contractMap.get(TokenType.YIELD_POOL)!.connect(poolAddress, provider);
        }

        /* Collateralisation ratio and loan to value */
        const minRatio = parseFloat(ethers.utils.formatUnits(ratio, 6));
        const loanToValue = 1 / minRatio;

        const bestRate = await poolContract.sellFYTokenPreview((10 ** decimals).toString());
        const maxBaseIn = await poolContract.getBaseBalance();

        const maxDebt = ethers.utils.parseUnits(debt.max.toString(), debt.dec);
        const minDebt = ethers.utils.parseUnits(debt.min.toString(), debt.dec);

        const maturityDate = new Date(lever.maturity * 1000);

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

          bestRate: convertToW3bNumber(bestRate, decimals, displayDigits),

          minDebt: convertToW3bNumber(minDebt, decimals, displayDigits),
          maxDebt: convertToW3bNumber(maxDebt, decimals, displayDigits),
          maxBase: convertToW3bNumber(maxBaseIn, decimals, displayDigits),

          tradeImage: logoMap.get(lever.tradePlatform),
          maturityDate: new Date(lever.maturity * 1000),
          
        } as ILever;

        updateState({ type: 'UPDATE_LEVERS', payload: connectedLever });
      });
    }
  }, [provider]);

  /* Set the initial selected lever if there is no lever selected */
  useEffect(() => {
    if (leverState.levers.size && !leverState.selectedLever) {
      updateState({
        type: 'SELECT_LEVER',
        payload: Array.from(leverState.levers.values())[0], // Take the first lever as default
      });
      console.log('Initial lever selected: ', Array.from(leverState.levers.values())[0]);
    }
  }, [leverState.levers]);

  /* ACTIONS TO CHANGE CONTEXT */
  const leverActions = {
    selectShort: (asset: IAsset) => updateState({ type: 'SELECT_SHORT', payload: asset }),
    selectLong: (asset: ILever) => updateState({ type: 'SELECT_LONG', payload: asset }),
    selectLever: (lever: ILever) => updateState({ type: 'SELECT_LEVER', payload: lever }),
  };

  return (
    <LeverContext.Provider value={[leverState as ILeverContextState, leverActions]}>{children}</LeverContext.Provider>
  );
};

export { LeverContext };

export default LeverProvider;
