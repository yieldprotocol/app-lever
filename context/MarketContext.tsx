import { ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber, ethers } from 'ethers';
import React, { useContext, useEffect, useMemo, useReducer } from 'react';
import { ILeverContextState, ILever, LeverContext } from './LeverContext';

export interface IMarketContextState {
  maturity: number;
  decimals: number;
  sharesReserves: BigNumber;
  fyTokenReserves: BigNumber;
  fyTokenRealReserves: BigNumber;
  totalSupply: BigNumber;
  ts: BigNumber;
  g1: BigNumber;
  g2: BigNumber;
  c?: BigNumber;
  mu?: BigNumber;
}

const initState: IMarketContextState = {
  maturity: 0,
  decimals:18, 
  sharesReserves: ZERO_BN,
  fyTokenReserves: ZERO_BN,
  fyTokenRealReserves: ZERO_BN,
  totalSupply: ZERO_BN,
  ts: ZERO_BN,
  g1: ZERO_BN,
  g2: ZERO_BN,
  c: undefined,
  mu: undefined,
};

const MarketContext = React.createContext<any>({});

const marketReducer = (state: IMarketContextState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    case 'UPDATE_MARKET':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

const MarketProvider = ({ children }: any) => {
  /* LOCAL STATE */
  const [marketState, updateState] = useReducer(marketReducer, initState);

  /* STATE from other contexts */
  const [leverState]: [ILeverContextState] = useContext(LeverContext);
  const { selectedLever } = leverState;

  const getPoolInfo = async (lever: ILever): Promise<IMarketContextState> => {
    /* Get all the data simultanenously in a promise.all */
    const [baseReserves, fyTokenReserves, totalSupply, ts, g1, g2, maturity, decimals, fyTokenRealReserves] = await Promise.all([
      lever.poolContract.getBaseBalance(),
      lever.poolContract.getFYTokenBalance(),
      lever.poolContract.totalSupply(),   
      lever.poolContract.ts(),
      lever.poolContract.g1(),
      lever.poolContract.g2(),
      lever.poolContract.maturity(),
      lever.investTokenContract.decimals(),
      lever.investTokenContract.balanceOf(lever.poolAddress),
    ]);

    let sharesReserves: BigNumber;
    let c: BigNumber | undefined;
    let mu: BigNumber | undefined;
    let currentSharePrice: BigNumber;
    let sharesToken: string;

    try {
      [sharesReserves, c, mu, currentSharePrice, sharesToken] = await Promise.all([
        lever.poolContract.getSharesBalance(),
        lever.poolContract.getC(),
        lever.poolContract.mu(),
        lever.poolContract.getCurrentSharePrice(),
        lever.poolContract.sharesToken(),
      ]);
    } catch (error) {
      sharesReserves = baseReserves;
      currentSharePrice = ethers.utils.parseUnits('1', 18); // TODO fix this decomals story
      console.log('using old pool contract that does not include c, mu, and shares');
    }

    const market_ = {
      maturity : parseInt(maturity),
      decimals,
      sharesReserves,
      fyTokenReserves,
      fyTokenRealReserves,
      totalSupply,
      ts,
      g1,
      g2,
      c,
      mu,
    };
    // console.log( market_ );
    /* always update market state on any getMarketInfo() call */
    updateState({ type: 'UPDATE_MARKET', payload: market_ }); // always update state on any market call
    return market_;
  };

  /* Update market State when selectedLever change */
  useEffect(() => {
    selectedLever && getPoolInfo(selectedLever);
  }, [selectedLever]);

  /* ACTIONS TO CHANGE CONTEXT */
  const marketActions = {
    getPoolInfo: async (lever: ILever): Promise<IMarketContextState> => await getPoolInfo(lever),
  };

  return <MarketContext.Provider value={[ marketState as IMarketContextState, marketActions ]}>{children}</MarketContext.Provider>;
};

export { MarketContext };

export default MarketProvider;
