import { BigNumber, ethers, utils } from 'ethers';
import { zeroPad } from 'ethers/lib/utils';
import { useContext, useEffect, useState } from 'react';
import { WETH, WSTETH } from '../config/assets';
import { ZERO_BN, ZERO_W3N } from '../constants';
import { IInputContextState, InputContext, W3bNumber } from '../context/InputContext';
import { ILeverContextState, LeverContext } from '../context/LeverContext';
import { AppState } from '../lib/types';
import { calculateAPRs } from '../lib/utils';

import { useStEthSim } from './LeverSims/useStEthSim';
import { useDebounce } from './generalHooks';
import { MAX_256 } from '@yield-protocol/ui-math';
import { useNotionalSim } from './LeverSims/useNotionalSim';

export interface LeverSimulation {
  investPosition: W3bNumber; // long asset obtained
  investValue: W3bNumber; // current value of long asset (in terms of short)

  debtPosition: W3bNumber; // debt at maturity
  debtValue: W3bNumber; // current Value if settling debt now

  shortInvested: W3bNumber; // total short asset
  shortBorrowed: W3bNumber; // amount of short asset borrowed

  flashFee?: W3bNumber;
  swapFee?: W3bNumber;

  // futureReturn: W3bNumber;
  // currentReturn: W3bNumber;
}

export interface ReturnSimulation {
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
  simulateReturn: (art:BigNumber, ink:BigNumber) => Promise<W3bNumber>;
  isSimulating: boolean;
  notification: Notification[];
  extraBucket: any[];
}

export const useLever = (supressInput:boolean = false) => {
  /* Bring in context*/
  const [leverState, leverActions]: [ILeverContextState, any] = useContext(LeverContext);
  const [inputState] = useContext(InputContext);

  const { selectedStrategy, shortAsset } = leverState;
  // const { input, leverage } = supressInput ? {input:ZERO_BN, leverage:0}: inputState;

  /* add in debounced leverage when using slider - to prevent excessive calcs */
  const debouncedLeverage = useDebounce(inputState?.leverage, 500);

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

  const { setAppState } = leverActions;

  /* Lever simulators */
  const stEthSim = useStEthSim();
  const notionalSim = useNotionalSim();

  /* Choose the correct lever simulator */
  useEffect(() => {
    if (selectedStrategy?.ilkId === WSTETH) {
      setSimulator(stEthSim);
    }
    if (selectedStrategy?.ilkId === 'NOTIONAL') {
      setSimulator(notionalSim);
    }
  }, [selectedStrategy, inputState] );

  useEffect(() => {
    (async () => {
      if (selectedStrategy && inputState?.input?.big.gt(ZERO_BN) && debouncedLeverage) {
        const simulated = await stEthSim.simulateInvest();

        setInvestPosition(simulated.investPosition);
        setInvestValue(simulated.investValue);
        setShortBorrowed(simulated.shortBorrowed);
        setShortInvested(simulated.shortInvested);
        setDebtPosition(simulated.debtPosition);
        // setDebtValue(stEthSim.debtValue);
        
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
  }, [selectedStrategy, inputState, debouncedLeverage]);


  // useEffect(() => {
  //   (async () => {
  //     if (selectedStrategy) {
  //       const simulatedReturn = await stEthSim.simulateReturn( );
  //       console.log( 'erere' ,  simulatedReturn.dsp )
  //     }
  //   })();
  // }, [selectedStrategy]);

  useEffect(() => {
    if (selectedStrategy && inputState?.input?.big.gt(ZERO_BN) && debouncedLeverage) {
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
  }, [selectedStrategy, inputState, debouncedLeverage]);

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

    // simulateInvest:  stEthSim?.simulateInvest,
    // simulateReturn:  stEthSim?.simulateReturn,
    isSimulating: stEthSim.isSimulating,
    // simNotification,
  };
};
