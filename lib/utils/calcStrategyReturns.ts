import Decimal from 'decimal.js';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { cleanValue } from '../../utils/appUtils';
import {
  ONE_DEC as ONE,
  SECONDS_PER_YEAR,
  sellFYToken,
  ZERO_DEC as ZERO,
  invariant,
  calcInterestRate,
} from '@yield-protocol/ui-math';
import { parseUnits } from 'ethers/lib/utils';

import { FYToken, Pool } from '@yield-protocol/ui-contracts';
import { IMarketContextState } from '../../context/MarketContext';


export interface ISeriesRoot {
  id: string;
  displayName: string;
  displayNameMobile: string;
  maturity: number;
  showSeries: boolean;

  fullDate: string;
  fyTokenContract: FYToken;
  fyTokenAddress: string;
  poolContract: Pool;
  poolAddress: string;
  poolName: string;
  poolVersion: string; // for signing
  poolSymbol: string; // for signing
  
  // startBlock: Block; // pool init block

  decimals: number;
  ts: BigNumber;
  g1: BigNumber;
  g2: BigNumber;

  baseId: string;

  color: string;
  textColor: string;
  startColor: string;
  endColor: string;

  oppositeColor: string;
  oppStartColor: string;
  oppEndColor: string;

  baseAddress: string;
}

export interface ISeries extends ISeriesRoot {
  apr: string;
  sharesReserves: BigNumber;
  sharesReserves_: string;
  fyTokenReserves: BigNumber;
  fyTokenRealReserves: BigNumber;
  totalSupply: BigNumber;
  totalSupply_: string;
  sharesAddress: string;

  poolTokens?: BigNumber | undefined;
  poolTokens_?: string | undefined;
  fyTokenBalance?: BigNumber | undefined;
  fyTokenBalance_?: string | undefined;

  poolPercent?: string | undefined;
  poolAPY?: string;
  seriesIsMature: boolean;

  // Yieldspace TV
  c: BigNumber | undefined;
  mu: BigNumber | undefined;
  getShares: (baseAmount: BigNumber) => BigNumber;
  getBase: (sharesAmount: BigNumber) => BigNumber;
  currentInvariant?: BigNumber;
  initInvariant?: BigNumber;
  // startBlock?: Block;
}

export interface IStrategyRoot {
  id: string;
  baseId: string;
  decimals: number;
  // strategyContract: Strategy;
  // startBlock?: Block;
}

export interface IStrategy extends IStrategyRoot {
  currentSeriesId: string;
  currentPoolAddr: string;
  nextSeriesId: string;

  currentSeries: ISeries | undefined;
  nextSeries: ISeries | undefined;
  active: boolean;

  initInvariant?: BigNumber;
  currentInvariant?: BigNumber;

  returnRate?: BigNumber | string;
  returnRate_?: string;

  strategyTotalSupply?: BigNumber;
  strategyTotalSupply_?: string;

  poolTotalSupply?: BigNumber;
  poolTotalSupply_?: string;

  strategyPoolBalance?: BigNumber;
  strategyPoolBalance_?: string;
  strategyPoolPercent?: string;

  accountBalance?: BigNumber;
  accountBalance_?: string;
  accountStrategyPercent?: string | undefined;

  accountPoolBalance?: BigNumber;
  accountPoolBalance_?: string;
  accountPoolPercent?: string | undefined;
}


// calculateAPR func from yieldMath, but without the maturity greater than now check
const calculateAPR = (
  tradeValue: BigNumber | string,
  amount: BigNumber | string,
  maturity: number,
  fromDate: number = Math.round(new Date().getTime() / 1000) // if not provided, defaults to current time.
): string | undefined => {
  const tradeValue_ = new Decimal(tradeValue.toString());
  const amount_ = new Decimal(amount.toString());

  const secsToMaturity = maturity - fromDate;
  const propOfYear = new Decimal(secsToMaturity / SECONDS_PER_YEAR);
  const priceRatio = amount_.div(tradeValue_);
  const powRatio = ONE.div(propOfYear);
  const apr = priceRatio.pow(powRatio).sub(ONE);

  if (apr.gt(ZERO) && apr.lt(100)) {
    return apr.mul(100).toFixed();
  }
  return undefined;
};

/**
 *
 * Returns are LP returns per share
 * Returns are estimated using "forward-looking" and "backward-looking" methodologies:
 *
 * Forward-looking:
 *
 * a = pool share's estimated current apy
 * b = number of shares in pool
 * c = current share price in base
 * d = lp token total supply
 * e = fyToken interest rate
 * f = estimated value of fyTokens in pool in base
 * g = total estimated base value of pool b * c + f
 *
 * estimated apy =  blended shares apy + fyToken apy + fees apy
 * estimated apy = a * ((b * c) / g)   +   f / g     + fees apy
 *
 *
 * Backward-looking:
 *
 * value = each strategy token's value in base
 * a = strategy LP token balance
 * b = strategy total supply
 * c = shares value in base of pool
 * d = estimated fyToken value of pool
 * e = total LP token (pool) supply
 *
 * value =  a / b * (c + d) / e
 * estimated apy = value plugged into apy calculation func
 *
 *
 * @param input amount of base to use when providing liquidity
 * @returns {IStrategyReturns} use "returns" property for visualization (the higher apy of the two "returnsForward" and "returnsBackward" properties)
 */


// const useStrategyReturns = (
//   input: string | undefined,
//   strategy: IStrategy | undefined = undefined,
//   digits = 1
// ): IStrategyReturns => {
  
//   const strategy_ = strategy;

//   const series = strategy_?.currentSeries;

//   const inputToUse = cleanValue(!input || +input === 0 ? '1' : input, series?.decimals!);

//   // const { getTimeTillMaturity } = useTimeTillMaturity();

//   const [initSeries, setInitSeries] = useState<{
//     sharesReserves: BigNumber;
//     fyTokenReserves: BigNumber;
//     totalSupply: BigNumber;
//     ts: BigNumber;
//     g2: BigNumber;
//     c: BigNumber;
//   }>();



//   const NOW = useMemo(() => Math.round(new Date().getTime() / 1000), []);

  /**
   *
   * @returns {number} fyToken price in base, where 1 is at par with base
   */
  const getFyTokenPrice = (series: ISeries, input: string): number => {
    if (series) {
      const input_ = parseUnits(input, series.decimals);

      const sharesOut = sellFYToken(
        series.sharesReserves,
        series.fyTokenReserves,
        input_,
        '123',
        // getTimeTillMaturity(series.maturity),
        series.ts,
        series.g2,
        series.decimals,
        series.c,
        series.mu
      );
      const baseValOfInput = series.getBase(sharesOut);
      return +baseValOfInput / +input_;
    }
    return 1;
  };

  /**
   * Calculate the total base value of the pool
   * total = shares value in base + fyToken value in base
   *
   * @returns {number} total base value of pool
   */
  const getPoolBaseValue = (series: ISeries, input: string): number => {
    if (!series) return 0;

    const fyTokenPrice = getFyTokenPrice(series, input);
    const sharesBaseVal = +series.getBase(series.sharesReserves);
    const fyTokenBaseVal = +series.fyTokenRealReserves * fyTokenPrice;
    return sharesBaseVal + fyTokenBaseVal;
  };

  /**
   * Calculates estimated blended apy from shares portion of pool
   * @returns {number} shares apy of pool
   */
  const getSharesAPY = (series: ISeries, input: string): number => {
    const poolBaseValue = getPoolBaseValue(series, input);

    const poolAPY = '2.52';  // calculateAPR( )


    if (poolAPY) {
      const sharesBaseVal = +series.getBase(series.sharesReserves);
      const sharesValRatio = sharesBaseVal / poolBaseValue;
      return +poolAPY * sharesValRatio;
    }
    return 0;
  };

  /**
   * Caculate (estimate) how much fees are accrued to LP's using invariant func
   * Use the current and init invariant results from global context and fallback to manual calculation if unavailable
   * @returns {number}
   */
  const getFeesAPY = (series: ISeries, initSeries: ISeries | undefined): number => {
    
    let currentInvariant = series.currentInvariant;
    let initInvariant = series.initInvariant;


    if ((!series.currentInvariant || !series.initInvariant) ) {
      if (!initSeries) return 0;

      currentInvariant = invariant(
        series.sharesReserves,
        series.fyTokenReserves,
        series.totalSupply,
        '123', // getTimeTillMaturity(series.maturity),
        series.ts,
        series.g2,
        series.decimals,
        series.c,
        series.mu
      );

      initInvariant = invariant(
        initSeries.sharesReserves,
        initSeries.fyTokenReserves,
        initSeries.totalSupply,
        (series.maturity - 1).toString(),
        // (series.maturity - series.startBlock.timestamp).toString(),
        initSeries.ts,
        initSeries.g2,
        series.decimals,
        initSeries.c,
        series.mu
      );
    }

    // get apy estimate
    if (initInvariant && currentInvariant ) {
      // const res = calculateAPR(initInvariant, currentInvariant, NOW, series.startBlock.timestamp);
      // return !isNaN(+res!) ? +res! : 0;
    }

    return 0;
  };

  /**
   * Calculate (estimate) how much interest would be captured by LP position using market rates and fyToken proportion of the pool
   * @returns {number} estimated fyToken interest from LP position
   */
  const getFyTokenAPY = (series: ISeries, input: string): number => {
    if (!series) return 0;

    const marketInterestRate = calcInterestRate(
      series.sharesReserves,
      series.fyTokenReserves,
      series.ts,
      series.mu
    ).mul(100); // interest rate is formatted in decimal (.1) so multiply by 100 to get percent
    const fyTokenPrice = getFyTokenPrice(series, input);
    const poolBaseValue = getPoolBaseValue(series, input);
    const fyTokenValRatio = (+series.fyTokenRealReserves * fyTokenPrice) / poolBaseValue;
    return +marketInterestRate * fyTokenValRatio;
  };

  // /* get the init series data to use the invariant function */
  // useEffect(() => {
  //   (async () => {
  //     if (!series) return;
  //     const { poolContract, currentInvariant, initInvariant } = series;
  //     if (!currentInvariant || !initInvariant) {
  //       const [sharesReserves, fyTokenReserves, totalSupply, ts, g2, c] = await Promise.all([
  //         poolContract.getSharesBalance(),
  //         poolContract.getFYTokenBalance(),
  //         poolContract.totalSupply(),
  //         poolContract.ts(),
  //         poolContract.g2(),
  //         poolContract.getC(),
  //       ]);
  //       setInitSeries({ sharesReserves, fyTokenReserves, totalSupply, ts, g2, c });
  //     }
  //   })();
  // }, [series]);


  export const calcStrategyReturns = (series: ISeries, input: string, marketState: IMarketContextState ) => {

    const sharesAPY = getSharesAPY(series, input);
    const feesAPY = getFeesAPY(series, undefined);
    const fyTokenAPY = getFyTokenAPY(series, input);

    return {
      feesAPY: cleanValue(feesAPY.toString(), 2),
      sharesAPY: cleanValue(series.poolAPY, 2),
      sharesBlendedAPY: cleanValue(sharesAPY.toString(), 2),
      fyTokenAPY: cleanValue(fyTokenAPY.toString(), 2),
      blendedAPY: cleanValue((sharesAPY + feesAPY + fyTokenAPY).toString(), 2),
    };
  };


