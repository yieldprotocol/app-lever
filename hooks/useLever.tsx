import { BigNumber, ethers, utils } from 'ethers';
import { zeroPad } from 'ethers/lib/utils';
import { useContext, useEffect, useState } from 'react';
import { WETH, WSTETH } from '../config/assets';
import { ZERO_BN, ZERO_W3N } from '../constants';
import { IInputContextState, InputContext, W3bNumber } from '../context/InputContext';
import { ILeverContextState, LeverContext } from '../context/LeverContext';
import { AppState } from '../lib/protocol/types';
import { calculateAPRs } from '../lib/utils';

import { IPoolState, MarketContext } from '../context/MarketContext';
import { useStEthSim } from './LeverSims/useStEthSim';
import { useDebounce } from './generalHooks';


export interface LeverSimulation {
  investPosition: W3bNumber; // long asset obtained
  investValue: W3bNumber; // current value of long asset (in terms of short)

  debtPosition: W3bNumber; // debt at maturity
  debtValue: W3bNumber; // current Value if settling debt now

  shortInvested: W3bNumber; // total short asset
  shortBorrowed: W3bNumber; // amount of short asset borrowed

  flashFee?: W3bNumber;
  swapFee?: W3bNumber;
}

export enum NotificationType { INFO, WARN, ERROR }
export interface Notification { type: NotificationType, msg: string }

export interface simOutput {
  simulateLever: () => Promise<LeverSimulation>;
  isSimulating: boolean;
  notification: Notification[];
  extraBucket: any[];
}

export const useLever = () => {
  /* Bring in context*/
  const [leverState, leverActions]: [ILeverContextState, any] = useContext(LeverContext);
  const [inputState] = useContext(InputContext);

  const { selectedStrategy, shortAsset } = leverState;
  const { input, leverage } = inputState as IInputContextState;

  /* add in debounced leverage when using slider - to prevent excessive calcs */
  const debouncedLeverage = useDebounce(leverage, 500);

  const [investAPR, setInvestAPR] = useState<number>();
  const [borrowAPR, setBorrowAPR] = useState<number>();
  const [netAPR, setNetAPR] = useState<number>();

  const [investPosition, setInvestPosition] = useState<W3bNumber>(ZERO_W3N);
  const [investValue, setInvestValue] = useState<W3bNumber>(ZERO_W3N);
  const [debtPosition, setDebtPosition] = useState<W3bNumber>(ZERO_W3N);
  const [shortInvested, setShortInvested] = useState<W3bNumber>(ZERO_W3N);
  const [shortBorrowed, setShortBorrowed] = useState<W3bNumber>(ZERO_W3N);
  const [flashFee, setFlashFee] = useState<W3bNumber>();

  const { setAppState } = leverActions;

  /* use STETH lever simulations */
  const { simulateLever, isSimulating } = useStEthSim();

  useEffect(() => {
    (async () => {
      if (selectedStrategy && input?.big.gt(ZERO_BN) && debouncedLeverage) {
        const stEthSim = await simulateLever();
        setInvestPosition(stEthSim.investPosition);
        setInvestValue(stEthSim.investValue);
        setShortBorrowed(stEthSim.shortBorrowed);
        setShortInvested(stEthSim.shortInvested);
        setDebtPosition(stEthSim.debtPosition);
        // setDebtValue(stEthSim.debtValue);
        // console.log(stEthSim);
        const { netAPR, borrowAPR, investAPR } = calculateAPRs(
          investValue,
          debtPosition,
          shortInvested,
          shortBorrowed,
          debouncedLeverage.dsp,
          selectedStrategy.maturity
        );
        setNetAPR(netAPR);
        setBorrowAPR(borrowAPR);
        setInvestAPR(investAPR);
      }
    })();
  }, [selectedStrategy, input, debouncedLeverage]);

  const approve = async () => {
    if (input && selectedStrategy?.investTokenContract) {
      setAppState(AppState.Approving);
      const gasLimit = (
        await selectedStrategy.investTokenContract.estimateGas.approve(selectedStrategy.leverAddress, shortInvested.big)
      ).mul(2);
      const tx = await selectedStrategy.investTokenContract.approve(selectedStrategy.leverAddress, shortInvested.big);
      await tx.wait();
      setAppState(AppState.Transactable);
    }
  };

  const transact = async () => {
    if (input && selectedStrategy?.leverContract) {
      setAppState(AppState.Transacting);
      const gasLimit = (
        await selectedStrategy.leverContract.estimateGas.invest(
          selectedStrategy.seriesId,
          input.big,
          shortBorrowed.big,
          '0' // removeSlippage( investPosition.big),
        )
      ).mul(2);

      const investTx = await selectedStrategy.leverContract.invest(
        selectedStrategy.seriesId,
        input.big,
        shortBorrowed.big,
        '0', // removeSlippage( investPosition.big),
        {
          value: shortAsset?.id === WETH ? input.big : ZERO_BN, // value is set as input if using ETH
          gasLimit,
        }
      );

      await investTx.wait();
    }
  };

  return {
    approve,
    transact,

    // simulations
    investPosition,
    investValue,
    debtPosition,
    shortBorrowed,
    shortInvested,
    flashFee,

    // APRs and calcs
    borrowAPR,
    investAPR,
    netAPR,

    isSimulating,

  };
};
