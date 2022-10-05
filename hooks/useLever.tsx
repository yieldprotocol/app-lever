import { BigNumber, ethers, utils } from 'ethers';
import { zeroPad } from 'ethers/lib/utils';
import { useContext, useEffect, useState } from 'react';
import { WETH, WSTETH } from '../config/assets';
import { ZERO_BN, ZERO_W3N } from '../constants';
import { InputContext, W3bNumber } from '../context/InputContext';
import { ILeverContextState, LeverContext } from '../context/LeverContext';
import { AppState } from '../lib/types';

import { useStEthSim } from './LeverSims/useStEthSim';
import { useDebounce } from './generalHooks';
import { MAX_256 } from '@yield-protocol/ui-math';
import { useNotionalSim } from './LeverSims/useNotionalSim';
import useBlockTime from './useBlockTime';

import { calculateAPR } from '@yield-protocol/ui-math';

export interface LeverSimulation {
  investPosition: W3bNumber; // long asset obtained
  investValue: W3bNumber; // current value of long asset (in terms of short)

  debtPosition: W3bNumber; // debt at maturity
  debtValue: W3bNumber; // current Value if settling debt now

  shortInvested: W3bNumber; // total short asset
  shortBorrowed: W3bNumber; // amount of short asset borrowed

  flashFee?: W3bNumber;
  swapFee?: W3bNumber;

  // simulated return value
  futureReturn: W3bNumber;
  currentReturn: W3bNumber;
}

export enum NotificationType {
  INFO,
  WARN,
  ERROR,
}

export interface Notification {
  type: NotificationType;
  msg: string;
}

export interface simOutput {
  simulateInvest: () => Promise<LeverSimulation>;
  simulateReturn: () => Promise<W3bNumber>;
  isSimulating: boolean;
  notification: Notification[];
  extraBucket: any[];
}

export const calculateAPRs = (
  investValue: W3bNumber, // 'short asset value' of long asset
  debtPosition: W3bNumber, // 'short asset value' of debt at maturity ( shortvalue === fyToken value here)
  shortInvested: W3bNumber, // total 'short value' (nb: NOT fytokens invested).
  shortBorrowed: W3bNumber, // 'short value' borrowed
  leverage: number,
  maturity: number,
  currentTime?: number // defaults to system time if zero
): {
  investAPR: number;
  borrowAPR: number;
  netAPR: number;
} => {
  const now = currentTime || Math.round(new Date().getTime() / 1000);
  const secsToMaturity = maturity - now;

  // const secsToMaturity = parseInt(getTimeToMaturity(maturity));
  const oneOverYearProp = 1 / (secsToMaturity / 31536000);

  console.log( investValue.big, shortInvested.big, maturity, currentTime )
  console.log('APR: ',  calculateAPR(shortInvested.big, investValue.big,  maturity, currentTime ) )

  const investAPR = shortInvested.dsp > 0 ? Math.pow(investValue.dsp/shortInvested.dsp, oneOverYearProp) - 1 : 0;
  const borrowAPR = shortBorrowed.dsp > 0 ? Math.pow(debtPosition.dsp/shortBorrowed.dsp, oneOverYearProp) - 1 : 0;
  const netAPR = (leverage * investAPR) - ((leverage - 1) * borrowAPR);

  return { investAPR, borrowAPR, netAPR };
};

export const useLever = () => {
  /* Bring in context*/
  const [leverState, leverActions]: [ILeverContextState, any] = useContext(LeverContext);
  const { selectedPosition, selectedStrategy, shortAsset } = leverState;

  const [inputState] = useContext(InputContext);
  const { input, leverage } = inputState ? inputState : { input: undefined, leverage: undefined };

  /* add in debounced leverage when using slider - to prevent excessive calcs */
  const debouncedLeverage = useDebounce(leverage, 500);

  const { currentTime } = useBlockTime();

  const [investAPR, setInvestAPR] = useState<number>(0);
  const [borrowAPR, setBorrowAPR] = useState<number>(0);
  const [netAPR, setNetAPR] = useState<number>(0);

  const [simulator, setSimulator] = useState<any>();

  const [investPosition, setInvestPosition] = useState<W3bNumber>(ZERO_W3N);
  const [investValue, setInvestValue] = useState<W3bNumber>(ZERO_W3N);
  const [debtPosition, setDebtPosition] = useState<W3bNumber>(ZERO_W3N);
  const [shortInvested, setShortInvested] = useState<W3bNumber>(ZERO_W3N);
  const [shortBorrowed, setShortBorrowed] = useState<W3bNumber>(ZERO_W3N);
  const [flashFee, setFlashFee] = useState<W3bNumber>();

  const [currentReturn, setCurrentReturn] = useState<W3bNumber>(ZERO_W3N);
  const [futureReturn, setFutureReturn] = useState<W3bNumber>(ZERO_W3N);

  const { setAppState } = leverActions;

  /* Lever simulators */
  const stEthSim = useStEthSim(input, leverage);
  const notionalSim = useNotionalSim();

  // TODO: /* Choose the correct lever simulator */
  // useEffect(() => {
  //   if (selectedStrategy?.ilkId === WSTETH) {
  //     setSimulator(stEthSim);
  //   }
  //   if (selectedStrategy?.ilkId === 'NOTIONAL') {
  //     setSimulator(notionalSim);
  //   }
  // }, [selectedStrategy, input] );

  /* Use the simulator on leverage/input change */
  useEffect(() => {
    (async () => {
      if (selectedStrategy && debouncedLeverage) {
        const simulated = await stEthSim.simulateInvest();

        setInvestPosition(simulated.investPosition);
        setInvestValue(simulated.investValue);
        setShortBorrowed(simulated.shortBorrowed);
        setShortInvested(simulated.shortInvested);
        setDebtPosition(simulated.debtPosition);
        // setDebtValue(stEthSim.debtValue);

        const { netAPR, borrowAPR, investAPR } = calculateAPRs(
          simulated.investValue,
          simulated.debtPosition,
          simulated.shortInvested,
          simulated.shortBorrowed,
          debouncedLeverage.dsp,
          selectedStrategy.maturity,
          currentTime
        );
        setNetAPR(netAPR);
        setBorrowAPR(borrowAPR);
        setInvestAPR(investAPR);
      }
    })();
  }, [selectedStrategy, debouncedLeverage, input]);

  /* Calculate the expected returns if a position os selected */
  useEffect(() => {
    (async () => {
      if (selectedPosition) {
        const simulatedReturn_ = await stEthSim.simulateReturn();
        setCurrentReturn(simulatedReturn_);
        setFutureReturn(simulatedReturn_);
      }
    })();
  }, [selectedPosition]);

  const approve = async () => {
    if (inputState && selectedStrategy?.investTokenContract) {
      setAppState(AppState.Approving);
      const gasLimit =
        // await selectedStrategy.investTokenContract.estimateGas.approve(selectedStrategy.leverAddress, shortInvested.big)
        (await selectedStrategy.investTokenContract.estimateGas.approve(selectedStrategy.leverAddress, MAX_256)).mul(2);
      // const tx = await selectedStrategy.investTokenContract.approve(selectedStrategy.leverAddress, shortInvested.big);
      const tx = await selectedStrategy.investTokenContract.approve(selectedStrategy.leverAddress, MAX_256);
      await tx.wait();
      setAppState(AppState.Transactable);
    }
  };

  const transact = async () => {
    // await approve();
    if (inputState && selectedStrategy?.leverContract) {
      setAppState(AppState.Transacting);
      // const gasLimit = (
      //   await selectedStrategy.leverContract.estimateGas.invest(
      //     selectedStrategy.seriesId,
      //     ethers.utils.parseUnits('1', 18),  // input.big,
      //     '0' // removeSlippage( investPosition.big),
      //   )
      // ).mul(2);
      const investTx = await selectedStrategy.leverContract.invest(
        selectedStrategy.seriesId,
        inputState.input.big,
        // ethers.utils.parseUnits('1', 18), // shortBorrowed.big,
        '0', // removeSlippage( investPosition.big),
        {
          value: shortAsset?.id === WETH ? inputState.input.big : ZERO_BN, // value is set as input if using ETH
          // gasLimit,
        }
      );
      await investTx.wait();
    }
  };

  return {
    approve,
    transact,

    // simulated position
    investPosition,
    investValue,
    debtPosition,
    shortBorrowed,
    shortInvested,

    // fees
    flashFee,

    // simulated returns
    currentReturn,
    futureReturn,

    // APRs and calcs
    borrowAPR,
    investAPR,
    netAPR,

    isSimulating: stEthSim.isSimulating,
    // simNotification,
  };
};
