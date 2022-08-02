import React, { useCallback, useContext, useReducer } from 'react';
import { BigNumber, ethers } from 'ethers';


// import { IERC20Address, SeriesId } from "../balances";
import { ContractAddress, WETH, YIELD_ST_ETH_LEVER } from "../contracts";

interface ILeverContextState { 
    contracts: any
    strategies: any
    selectedStrategy: any
    account: any 
}

export enum AssetId {
    WEth = "0x303000000000",
    WStEth = "0x303400000000",
    Usdc = "0x303200000000",
  }
  
  // TODO: Idea: create this from AssetId. I.e., represent FyUsdc as
  // 'fy' + AssetId.Usdc
  export enum Token {
      FyUsdc,
      FyWeth
  }
  
  export enum StrategyName {
    WStEth,
  }
  
  /**
   * The type of token that is invested for this strategy.
   * -  If the type is `FyToken`, the address is derived from the selected
   *    `seriesId`.
   */
  enum InvestTokenType {
    /** Use the debt token corresponding to the series. */
    FyToken,
  }
  
  /**
   * A strategy represents one particular lever to use, although it can contain
   * multiple series with different maturities.
   */
  // TODO: Find the best format to be applicable for any strategy while avoiding
  //  code duplication.
  export interface Strategy {
    /** This is the token that is invested for this strategy. */
    investToken: InvestTokenType;
    /** The token that is obtained after unwinding. */
    // outToken: [IERC20Address, Token | AssetId]; // this should probably be base? 
    
    lever: ContractAddress;
    ilkId: AssetId;
    baseId: AssetId;
  
    /** Manually ship the series Ids with the strategy - i think this is reasonable  */
    series: string[]; // seriesID type?
  }

const LeverContext = React.createContext<any>({});

const initState: ILeverContextState = {
  contracts: 'er',
  strategies: {
    [StrategyName.WStEth]: {
      investToken: InvestTokenType.FyToken,
      outToken: [WETH, AssetId.WEth],
      lever: YIELD_ST_ETH_LEVER,
      ilkId: AssetId.WStEth,
      baseId: AssetId.WEth,
      series: "0x303030370000",
    },
    [StrategyName.WStEth]: {
      investToken: InvestTokenType.FyToken,
      outToken: [WETH, AssetId.WEth],
      lever: YIELD_ST_ETH_LEVER,
      ilkId: AssetId.WStEth,
      baseId: AssetId.WEth,
      series: "0x303030370000",
    },
  },
  selectedStrategy: 'x',
  account: 'x',
};

const leverReducer = (state: ILeverContextState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    // case LeverState.UPDATE_PAIR:
    //   return {
    //     ...state,
    //     pairMap: new Map(state.pairMap.set(action.payload.pairId, action.payload.pairInfo)),
    //   };
    default:
      return state;
  }
};

const LeverProvider = ({ children }: any) => {
  /* STATE FROM CONTEXT */

  /* CHANGE CONTEXT ACTIONS */

  /* LOCAL STATE */
  const [leverState, updateState] = useReducer(leverReducer, initState);
  return <LeverContext.Provider value={ leverState }>{children}</LeverContext.Provider>;
};

export { LeverContext };
export default LeverProvider;