import { useContext, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { calculateAPR, sellBase, sellFYToken, ZERO_BN } from '@yield-protocol/ui-math';
import { contractFactories, WSTETH } from '../../config/contractRegister';
import { IInputContextState, InputContext, W3bNumber } from '../../context/InputContext';

import { IPoolState, MarketContext } from '../../context/MarketContext';
import { convertToW3bNumber, getTimeToMaturity } from '../../lib/utils';
import { LeverContext } from '../../context/LeverContext';
import { WETH_ST_ETH_STABLESWAP, WST_ETH } from '../../contracts';

export interface IAPRs {
  investAPR: number;
  borrowAPR: number;
  netAPR: number;
}

export const getAPRs = (
  investPosition: W3bNumber,
  debtPosition: W3bNumber,
  baseInvested: W3bNumber,
  baseBorrowed: W3bNumber,
  leverage: number,
  maturity: number,
) : IAPRs => {

  const investRate = calculateAPR( investPosition.big, baseInvested.big,  maturity );
  const investAPR = investRate ? parseFloat(investRate)*100 : 0;

  const borrowRate = calculateAPR( baseBorrowed.big, debtPosition.big, maturity );
  const borrowAPR = borrowRate ? parseFloat(borrowRate)*100 : 0;
  
  const netAPR = leverage * investAPR - (leverage - 1) * borrowAPR;

  // const [investAPR, setInvestAPR] = useState<number>();
  // const [borrowAPR, setBorrowAPR] = useState<number>();
  // const [netAPR, setNetAPR] = useState<number>();

  // useEffect(() => {
  //   if (investPosition && baseInvested && maturity) {
  //     const rate_ = calculateAPR( investPosition.big, baseInvested.big,  maturity );
  //     const percent_ = rate_ ? parseFloat(rate_)*100 : 0;
  //     setInvestAPR(percent_ );
  //   }
  // }, [investPosition, baseInvested && maturity]);

  // useEffect(() => {
  //   if (debtPosition && baseBorrowed && maturity) {
  //     const rate_ = calculateAPR( baseBorrowed.big, debtPosition.big, maturity );
  //     const percent_ = rate_ ? parseFloat(rate_)*100 : 0;
  //     setBorrowAPR(percent_ );
  //   }
  // }, [debtPosition, baseBorrowed, maturity]);

  // useEffect(() => {
  //   if (leverage && investAPR && borrowAPR && maturity) {
  //     setNetAPR(leverage * investAPR - (leverage - 1) * borrowAPR);
  //   }
    
  // }, [leverage, investAPR, borrowAPR ]);

  return { investAPR, borrowAPR, netAPR };
};
