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

  /* Borrowing simulation: */
  shortBorrowed: W3bNumber; // amount of short asset borrowed
  debtAtMaturity: W3bNumber; // debt owed at maturity
  debtCurrent: W3bNumber; // current Value of debt (if settling now )

  flashBorrowFee: W3bNumber;

  /* Investment simulation: */
  shortInvested: W3bNumber; // TOTAL short-asset used for investment (input + borrow)
  investmentPosition: W3bNumber; // long-asset obtained
  investmentAtMaturity: W3bNumber; // Est. value of investment at maturity
  investmentCurrent: W3bNumber; // Current value of long asset (if unwinding now)

  investmentFee: W3bNumber;

  /* Simulated return value (in Short-Asset terms) */
  // returnAtMaturity: W3bNumber;
  // returnCurrent: W3bNumber;

  /**
   * calculated values 
   * */ 
  netAPR: number,
  borrowAPR: number,
  investAPR: number,

  pnl: number,
  borrowLimitUsed: number,
  maxLeverage: number,

  /* flags */ 
  isSimulating:boolean,


  /* actions */
  approve: ()=> void;
  transact: ()=> void;

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

export const useLever = () => {
  /* Bring in context*/
  const [leverState, leverActions]: [ILeverContextState, any] = useContext(LeverContext);
  const { selectedPosition, selectedStrategy, shortAsset } = leverState;
  const { setAppState } = leverActions;

  const [inputState] = useContext(InputContext);
  const { input, leverage } = inputState ? inputState : { input: undefined, leverage: undefined };

  /* add in debounced leverage when using slider - to prevent excessive calcs */
  const debouncedLeverage = useDebounce(leverage, 500);

  const { currentTime } = useBlockTime();
  
  /* Lever simulators */
  const stEthSim = useStEthSim(input, leverage);
  const notionalSim = useNotionalSim();

  const [simulator, setSimulator] = useState<any>();

  // Resutls from simulation: 
  const [investmentPosition, setInvestmentPosition] = useState<W3bNumber>(ZERO_W3N);
  const [investmentCurrent, setInvestmentCurrent] = useState<W3bNumber>(ZERO_W3N);
  const [investmentAtMaturity, setInvestmentAtMaturity] = useState<W3bNumber>(ZERO_W3N);

  const [debtAtMaturity, setDebtAtMaturity] = useState<W3bNumber>(ZERO_W3N);
  const [shortInvested, setShortInvested] = useState<W3bNumber>(ZERO_W3N);
  const [shortBorrowed, setShortBorrowed] = useState<W3bNumber>(ZERO_W3N);

  const [flashBorrowFee, setFlashBorrowFee] = useState<W3bNumber>();
  const [investmentFee, setInvestmentFee] = useState<W3bNumber | number>();


  // Calculated APRS: 
  const [investAPR, setInvestAPR] = useState<number>(0);
  const [borrowAPR, setBorrowAPR] = useState<number>(0);
  const [netAPR, setNetAPR] = useState<number>(0);

  // Calulated parameters : 
  const [borrowLimitUsed, setBorrowLimitUsed] = useState<number>(0);
  const [pnl, setPnl] = useState<number>(0);
  const [maxLeverage, setMaxLeverage] = useState<number>(5);

  const [currentReturn, setCurrentReturn] = useState<W3bNumber>(ZERO_W3N);
  const [futureReturn, setFutureReturn] = useState<W3bNumber>(ZERO_W3N);


  // TODO: /* Choose the correct lever simulator */
  // useEffect(() => {
  //   if (selectedStrategy?.ilkId === WSTETH) {
  //     setSimulator(stEthSim);
  //   }
  //   if (selectedStrategy?.ilkId === 'NOTIONAL') {
  //     setSimulator(notionalSim);
  //   }
  // }, [selectedStrategy, input] );

  /* Use the simulator on each leverage/input change */
  useEffect(() => {
    (async () => {
      if (selectedStrategy && debouncedLeverage) {

        /** 
         * Simulate investment and set parameters locally 
         * */
        const simulated = await stEthSim.simulateInvest();

        setInvestmentPosition(simulated.investmentPosition);
        setInvestmentAtMaturity(simulated.investmentAtMaturity);
        setInvestmentCurrent(simulated.investmentCurrent);
        setShortBorrowed(simulated.shortBorrowed);
        setShortInvested(simulated.shortInvested);
        setDebtAtMaturity(simulated.debtAtMaturity);
        setFlashBorrowFee(simulated.flashBorrowFee);
        setInvestmentFee(simulated.investmentFee);

        /**
         * calculate the APR's based on the simulation 
         * */
        // alternative: Math.pow(investAtMaturity.dsp/investmentPosition.dsp, oneOverYearProp) - 1
        const investRate = calculateAPR(  
          simulated.investmentPosition.big,
          simulated.investmentAtMaturity.big,
          selectedStrategy.maturity,
          currentTime
        );
        const investAPR = parseFloat(investRate!);  
        setInvestAPR(investAPR); // console.log('investAPR: ', investAPR);
       
        // alternative: Math.pow(debtAtMaturity.dsp/shortBorrowed.dsp, oneOverYearProp) - 1 
        const borrowRate = calculateAPR(
          simulated.shortBorrowed.big,
          simulated.debtAtMaturity.big,
          selectedStrategy.maturity,
          currentTime
        );
        const borrowAPR = parseFloat(borrowRate!); 
        setBorrowAPR(borrowAPR); // console.log('borrowAPR: ', borrowAPR);
      
        const netAPR = debouncedLeverage.dsp * investAPR - (debouncedLeverage.dsp - 1) * borrowAPR; 
        setNetAPR(netAPR); // console.log('nettAPR: ', netAPR);

        /** 
         * Calculate
         * 
         * maxLeverage :  shortInvested  shortBorrowed 
         * Borrowing limit :  ( debtAtMaturity / ( investPosition * LTV )  )   =  
         * pnl : pos/prin - 1)
         */

        const maxLeverage_ =  3.9;  // input*rate / input*rate - input*LTV
        console.log( maxLeverage_  )
        setMaxLeverage(maxLeverage_)

        const borrowLimitUsed_ =  simulated.debtAtMaturity?.dsp! / (simulated.investmentPosition?.dsp! * selectedStrategy?.loanToValue)*100
        setBorrowLimitUsed(borrowLimitUsed_);

        const pnl_ = netAPR - investAPR // TODO: this is probably wrong. check it.  (investmentCurrent?.dsp!/shortInvested?.dsp! -1);
        setPnl(pnl_)

        const mLevarge = input ?  input.dsp / (input.dsp - input.dsp*selectedStrategy.loanToValue) : 3.7;
        console.log(input.dsp , selectedStrategy.loanToValue,  mLevarge ); 
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
    investmentPosition,
    investmentAtMaturity,
    investmentCurrent,

    debtAtMaturity,
    shortBorrowed,
    shortInvested,

    // fees
    flashBorrowFee,
    investmentFee,

    // simulated returns
    currentReturn,
    futureReturn,

    // APRs and calcs
    borrowAPR,
    investAPR,
    netAPR,

    borrowLimitUsed,
    pnl, 
    maxLeverage,

    isSimulating: stEthSim.isSimulating,
    // simNotification,
  };
};
