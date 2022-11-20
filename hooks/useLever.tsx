import { useContext, useEffect, useState, useMemo } from 'react';
import { ZERO_W3N } from '../constants';
import { IInputContextState, InputContext, W3bNumber } from '../context/InputContext';
import { ILeverContextState, LeverContext } from '../context/LeverContext';

import { useDebounce } from './generalHooks';
import { MAX_256 } from '@yield-protocol/ui-math';

import useBlockTime from './useBlockTime';

import { calculateAPR } from '@yield-protocol/ui-math';
import { IMarketContextState, MarketContext } from '../context/MarketContext';

import { IPositionContextState, PositionContext } from '../context/PositionContext';
import { ethers } from 'ethers';
import { useProvider } from 'wagmi';
import useInvestDivest from './useInvestDivest';

export type Simulator = (
  inputState: IInputContextState,
  leverState: ILeverContextState,
  marketState: IMarketContextState,
  positionState: IPositionContextState,
  provider: ethers.providers.BaseProvider,
  currentTime?: number
) => Promise<SimulatorOutput | undefined>;

export type SimulatorOutput = {
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

  /* transaction arguments */
  investArgs: any[];
  divestArgs: any[];

  /* simulation instance notifcation */
  notification: Notification | undefined;
};

/* TODO this is probably not the best way to initialise simulators */
export const NULL_OUTPUT = {
  shortBorrowed: ZERO_W3N,
  debtAtMaturity: ZERO_W3N,
  debtCurrent: ZERO_W3N,
  shortInvested: ZERO_W3N,
  investmentPosition: ZERO_W3N,
  investmentAtMaturity: ZERO_W3N,
  investmentCurrent: ZERO_W3N,
  flashBorrowFee: ZERO_W3N,
  investmentFee: ZERO_W3N,
  investArgs: [],
  divestArgs: [],
  notification: undefined,
} as SimulatorOutput;

export interface LeverSimulation extends SimulatorOutput {
  /**
   * calculated values
   * */
  netAPR: number;
  borrowAPR: number;
  investAPR: number;

  pnl: number;
  borrowLimitUsed: number;
  maxLeverage: number;

  /* flags */
  isSimulating: boolean;

  /* actions */
  approve: () => void;
  invest: () => void;
  divest: () => void;
}


export const useLever = (simulator: Simulator) => {
  /* Bring in context*/
  const [leverState, leverActions]: [ILeverContextState, any] = useContext(LeverContext);
  const { selectedLever, shortAsset } = leverState;
  const { setAppState } = leverActions;

  const [inputState] = useContext(InputContext);
  const { input, leverage } = inputState ? inputState : { input: undefined, leverage: undefined };

  const [marketState] = useContext(MarketContext);

  const [positionState]: [IPositionContextState, any] = useContext(PositionContext);
  // const { selectedPosition } = positionState;

  /* add in debounced leverage when using slider - to prevent excessive calcs */
  const debouncedLeverage = useDebounce(leverage, 500);
  const { currentTime } = useBlockTime();
  const provider = useProvider();

  // loading flags:
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Resutls from simulation:
  const [investmentPosition, setInvestmentPosition] = useState<W3bNumber>(ZERO_W3N);
  const [investmentCurrent, setInvestmentCurrent] = useState<W3bNumber>(ZERO_W3N);
  const [investmentAtMaturity, setInvestmentAtMaturity] = useState<W3bNumber>(ZERO_W3N);

  const [debtAtMaturity, setDebtAtMaturity] = useState<W3bNumber>(ZERO_W3N);
  const [shortInvested, setShortInvested] = useState<W3bNumber>(ZERO_W3N);
  const [shortBorrowed, setShortBorrowed] = useState<W3bNumber>(ZERO_W3N);

  const [flashBorrowFee, setFlashBorrowFee] = useState<W3bNumber>();
  const [investmentFee, setInvestmentFee] = useState<W3bNumber | number>();

  const [investArgs, setInvestArgs] = useState<any[]>([]);
  const [divestArgs, setDivestArgs] = useState<any[]>([]);

  // Calculated APRS:
  const [investAPR, setInvestAPR] = useState<number>(0);
  const [borrowAPR, setBorrowAPR] = useState<number>(0);
  const [netAPR, setNetAPR] = useState<number>(0);

  // Calulated parameters :
  const [borrowLimitUsed, setBorrowLimitUsed] = useState<number>(0);
  const [pnl, setPnl] = useState<number>(0);
  const [maxLeverage, setMaxLeverage] = useState<number>(5);

  const invest = useInvestDivest('invest', investArgs, !isSimulating && input?.dsp > 0, { value: input?.big });

  const divest = useInvestDivest('divest', divestArgs, !isSimulating);

  /* Use the simulator on each leverage/input change */
  useEffect(() => {
    !!selectedLever &&
      !!debouncedLeverage &&
      (async () => {
        /**
         * Simulate investment and set parameters locally
         * */
        setIsSimulating(true);
        const simulated = await simulator(inputState, leverState, marketState, positionState, provider);

        if (simulated) {
          setInvestmentPosition(simulated.investmentPosition);
          setInvestmentAtMaturity(simulated.investmentAtMaturity);
          setInvestmentCurrent(simulated.investmentCurrent);
          setShortBorrowed(simulated.shortBorrowed);
          setShortInvested(simulated.shortInvested);
          setDebtAtMaturity(simulated.debtAtMaturity);
          setFlashBorrowFee(simulated.flashBorrowFee);
          setInvestmentFee(simulated.investmentFee);

          setInvestArgs(simulated.investArgs);
          setDivestArgs(simulated.divestArgs);

          setIsSimulating(false);

          /**
           * calculate the APR's based on the simulation
           * */
          // alternative: Math.pow(investAtMaturity.dsp/investmentPosition.dsp, oneOverYearProp) - 1
          const investRate = calculateAPR(
            simulated.investmentPosition.big,
            simulated.investmentAtMaturity.big,
            selectedLever.maturity,
            currentTime
          );
          const investAPR = parseFloat(investRate!);
          setInvestAPR(investAPR); // console.log('investAPR: ', investAPR);

          // alternative: Math.pow(debtAtMaturity.dsp/shortBorrowed.dsp, oneOverYearProp) - 1
          const borrowRate = calculateAPR(
            simulated.shortBorrowed.big,
            simulated.debtAtMaturity.big,
            selectedLever.maturity,
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
          const inp_rat = input?.dsp > 0 ? input.dsp * selectedLever.bestRate.dsp : 0;
          const inp_ltv = input?.dsp > 0 ? input.dsp * selectedLever.loanToValue : 0;
          const maxLeverage_ = inp_rat / (inp_rat - inp_ltv); // input*rate / input*rate - input*LTV
          setMaxLeverage(maxLeverage_);

          const borrowLimitUsed_ =
            (simulated.debtAtMaturity?.dsp! / (simulated.investmentPosition?.dsp! * selectedLever?.loanToValue)) * 100;
          setBorrowLimitUsed(borrowLimitUsed_);

          const pnl_ = isNaN(netAPR - investAPR) ? 0 : netAPR - investAPR;
          setPnl(pnl_);
        }
      })();
  }, [input, debouncedLeverage, leverState, marketState, positionState, provider]);

  // const approve = async () => {
  //   if (inputState && selectedLever?.investTokenContract) {
  //     setAppState(AppState.Approving);
  //     // const gasLimit =
  //     //   // await selectedLever.investTokenContract.estimateGas.approve(selectedLever.leverAddress, shortInvested.big)
  //     //   (await selectedLever.investTokenContract.estimateGas.approve(selectedLever.leverAddress, MAX_256)).mul(2);

  //     // const tx = await selectedLever.investTokenContract.approve(selectedLever.leverAddress, shortInvested.big);
  //     const tx = await selectedLever.investTokenContract.approve(selectedLever.leverAddress, MAX_256);
  //     await tx.wait();
  //     setAppState(AppState.Transactable);
  //   }
  // };

  return {
    // approve,
    invest,
    divest,

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

    // APRs and calcs
    borrowAPR,
    investAPR,
    netAPR,

    borrowLimitUsed,
    pnl,
    maxLeverage,

    isSimulating,
    // simNotification,
  };
};
