import { useContext, useEffect, useState } from 'react';
import { ZERO_BN } from '../constants';
import { IInputContextState, InputContext } from '../context/InputContext';
import { ILeverContextState, LeverContext } from '../context/LeverContext';
import { useDebounce } from './generalHooks';
import { useBlockTime } from './chainHooks';
import { calculateAPR } from '@yield-protocol/ui-math';
import { IMarketContextState, MarketContext } from '../context/MarketContext';
import { IPositionContextState, PositionContext } from '../context/PositionContext';
import { useProvider } from 'wagmi';
import { Provider, W3bNumber, Notification, Operation } from '../lib/types';
import { useRouter } from 'next/router';
import useDivest from './useDivest';
import useInvest from './useInvest';
import { BigNumber } from 'ethers';
import { toast } from 'react-toastify';

export type Simulator = (
  inputState: IInputContextState,
  leverState: ILeverContextState,
  marketState: IMarketContextState,
  positionState: IPositionContextState,
  provider: Provider,
  existingPositionSim?: boolean,
  currentTime?: number
) => Promise<SimulatorOutput | undefined>;

export type SimulatorOutput = {
  /* Borrowing simulation: */
  shortAssetInput: W3bNumber; // amount of short asset input
  shortAssetBorrowed: W3bNumber; // Amount of short asset borrowed
  debtAtMaturity: W3bNumber; // debt owed at maturity
  debtCurrent: W3bNumber; // current Value of debt (if settling now)
  flashBorrowFee: W3bNumber;

  shortAssetObtained: W3bNumber; // TOTAL short-asset available for investment (input + borrow)

  /* Investment simulation: */
  longAssetObtained: W3bNumber; // TOTAL long-asset obtained (by using short asset obtained )
  investmentAtMaturity: W3bNumber; // Projected/ Estimated value of investment at maturity
  investmentValue: W3bNumber; // Value of long asset at maturity (assuminig no price/rate change)
  tradingFee: W3bNumber; // fee for trading long asset

  /* Transaction Arguments */
  investArgs: (string | BigNumber | Operation)[] | undefined;
  divestArgs: (string | BigNumber | Operation)[] | undefined;

  /* simulation instance notifcation */
  notification: Notification | undefined;
};

export interface ILeverSimulation extends SimulatorOutput {
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
  invest: () => void;
  divest: () => void;
}

export const useLever = (simulator: Simulator): ILeverSimulation => {
  /* Bring in context*/
  const [leverState] = useContext(LeverContext);
  const [inputState] = useContext(InputContext);
  const { input, leverage, selectedLever } = inputState;

  /* Add in debounced leverage when using slider and input - to prevent excessive calcs */
  const debouncedInput = useDebounce(input, 500);
  const debouncedLeverage = useDebounce(leverage, 500);

  const [marketState] = useContext(MarketContext);
  const [positionState]: [IPositionContextState, any] = useContext(PositionContext);

  const { currentTime } = useBlockTime();
  const provider = useProvider();
  const { pathname } = useRouter();

  // /* If the url references a series/vault...set that one as active */
  // useEffect(() => {
  //   pathname &&  console.log(pathname.split('/')[1] ) // setPath(pathname.split('/')[1]);
  // }, [pathname]);

  // loading flags:
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulation, setSimulation] = useState<SimulatorOutput>({} as SimulatorOutput);

  // Calculated APRS:
  const [investAPR, setInvestAPR] = useState<number>(0);
  const [borrowAPR, setBorrowAPR] = useState<number>(0);
  const [netAPR, setNetAPR] = useState<number>(0);

  // Calulated parameters :
  const [borrowLimitUsed, setBorrowLimitUsed] = useState<number>(0);
  const [pnl, setPnl] = useState<number>(0);
  const [maxLeverage, setMaxLeverage] = useState<number>(5);

  const invest = useInvest(simulation?.investArgs || [], pathname === '/lever');
  const divest = useDivest(simulation?.divestArgs || [], pathname === '/positions');

  /**
   * Calculate the APR's based on the simulation
   **/
  const calcAPRs = (sim: SimulatorOutput) => {
    console.log(sim.longAssetObtained.dsp, sim.investmentAtMaturity.dsp);
    // alternative: Math.pow(investAtMaturity.dsp/investmentPosition.dsp, oneOverYearProp) - 1
    const investRate = calculateAPR(
      sim.longAssetObtained.big,
      sim.investmentAtMaturity.big,
      selectedLever!.maturity,
      currentTime
    );

    const investAPR = parseFloat(investRate! || '0');
    setInvestAPR(investAPR); // console.log('investAPR: ', investAPR);

    // alternative: Math.pow(debtAtMaturity.dsp/shortBorrowed.dsp, oneOverYearProp) - 1
    const borrowRate = calculateAPR(
      sim.shortAssetBorrowed.big,
      sim.debtAtMaturity.big,
      selectedLever!.maturity,
      currentTime
    );
    const borrowAPR = parseFloat(borrowRate! || '0');
    setBorrowAPR(borrowAPR); // console.log('borrowAPR: ', borrowAPR);

    const netAPR = leverage.dsp * investAPR - (leverage.dsp - 1) * borrowAPR;
    setNetAPR(netAPR); // console.log('nettAPR: ', netAPR);

    /**
     * Calculate:
     * maxLeverage >  shortInvested  shortBorrowed
     * Borrowing limit >  ( debtAtMaturity / ( investPosition * LTV )  )   =
     * pnl : pos/prin - 1)
     */
    const inp_rat = input?.dsp > 0 ? input.dsp * selectedLever!.bestRate.dsp : 0;
    const inp_ltv = input?.dsp > 0 ? input.dsp * selectedLever!.loanToValue : 0;
    const maxLeverage_ = inp_rat / (inp_rat - inp_ltv); // input*rate / input*rate - input*LTV
    console.log( maxLeverage_ )
    setMaxLeverage( Math.round((maxLeverage_ + Number.EPSILON) * 1000) / 1000  );

    const borrowLimitUsed_ =
      (sim.debtAtMaturity.dsp! / (sim.longAssetObtained.dsp! * selectedLever!.loanToValue)) * 100;
    setBorrowLimitUsed(borrowLimitUsed_);

    const pnl_ = isNaN(netAPR - investAPR) ? 0 : netAPR - investAPR;
    setPnl(pnl_);

    setSimulation(sim);
  };

  /* Use the simulator on each leverage/input change */
  useEffect(() => {
    const positionView = pathname === '/positions';

    if (
      selectedLever &&
      debouncedLeverage &&
      provider &&
      (debouncedInput.big.gt(ZERO_BN) || positionState.selectedPosition)
    ) {
      (async () => {
        console.log('asdasds');
        /**
         * Simulate investment and set parameters locally
         * */
        setIsSimulating(true);
        const simulated = await simulator(inputState, leverState, marketState, positionState, provider, positionView);
        // simulated && setSimulation(simulated);
        simulated && calcAPRs(simulated);
        
        setIsSimulating(false);
        console.log('ok,...simulated');
      })();
    }
  }, [debouncedInput, debouncedLeverage, leverState, marketState, positionState, provider, pathname, selectedLever]);

  return {
    invest,
    divest,

    ...simulation,

    // APRs and calcs
    borrowAPR,
    investAPR,
    netAPR,

    borrowLimitUsed,
    pnl,
    maxLeverage,

    isSimulating,
  };
};
