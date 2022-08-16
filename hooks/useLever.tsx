import { BigNumber, ethers, utils } from 'ethers';
import { zeroPad } from 'ethers/lib/utils';
import { useContext, useEffect, useMemo, useState } from 'react';
import { WETH, WSTETH } from '../config/assets';
import { ZERO_BN, ZERO_W3N } from '../constants';
import { IInputContextState, InputContext, W3bNumber } from '../context/InputContext';
import { ILeverContextState, LeverContext } from '../context/LeverContext';
import { AppState } from '../lib/protocol/types';
import { calculateAPRs, convertToW3bNumber, getTimeToMaturity } from '../lib/utils';

import { sellBase, sellFYToken } from '@yield-protocol/ui-math';
import { IPoolState, MarketContext } from '../context/MarketContext';
import { leverSimulation } from '../components/lever/EstPositionWidget';
import { useStEthSim } from './LeverSims/useStEthSim';

const OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '0.1%' },
  { value: 5, label: '0.5%' },
  { value: 10, label: '1%' },
  { value: 50, label: '5%' },
];

export const useLever = () => {
  /* Bring in context*/
  const [leverState, leverActions]: [ILeverContextState, any] = useContext(LeverContext);
  const [inputState] = useContext(InputContext);
  const [marketState]: [IPoolState] = useContext(MarketContext);

  const { selectedStrategy, shortAsset, longAsset } = leverState;
  const { input, leverage } = inputState as IInputContextState;

  const { setAppState } = leverActions;

  const [slippage, setSlippage] = useState(OPTIONS[1].value);
  const changeSlippage = (value: number) => setSlippage(value * 10); // check
  const addSlippage = (num: BigNumber, slippage: number) => num.mul(1000 + slippage).div(1000);
  const removeSlippage = (num: BigNumber, slippage: number) => num.mul(1000 - slippage).div(1000);

  const toW3bNumber = (value: BigNumber): W3bNumber => {
    return convertToW3bNumber(value, shortAsset?.decimals, shortAsset?.displayDecimals);
  };

  const inputAsFyToken: W3bNumber = useMemo(() => {
    if (input.big.gt(ZERO_BN)) {
      const fyTokens = sellBase(
        marketState.sharesReserves,
        marketState.fyTokenReserves,
        input.big,
        getTimeToMaturity(marketState.maturity),
        marketState.ts,
        marketState.g1,
        marketState.decimals
      );
      return toW3bNumber(fyTokens);
    }
    return ZERO_W3N;
  }, [input, marketState]);

  const totalToInvest: W3bNumber = useMemo(() => {
    if (inputAsFyToken.big.gt(ZERO_BN)) {
      const total_ = inputAsFyToken.big.mul(leverage.big).div(100);
      return toW3bNumber(total_); /* set as w3bnumber  */
    }
    return ZERO_W3N;
  }, [inputAsFyToken, leverage]);

  const valueOfInvestment: W3bNumber = useMemo(() => {
    if (totalToInvest.big.gt(ZERO_BN)) {
      const baseValue = sellFYToken(
        marketState.sharesReserves,
        marketState.fyTokenReserves,
        totalToInvest.big,
        getTimeToMaturity(marketState.maturity),
        marketState.ts,
        marketState.g1,
        marketState.decimals
      );
      return toW3bNumber(baseValue);
    }
    return ZERO_W3N;
  }, [totalToInvest]);

  const toBorrow: W3bNumber = useMemo(() => {
    if (inputAsFyToken) {
      const toBorrow_ = totalToInvest.big.sub(inputAsFyToken.big);
      return toW3bNumber(toBorrow_); /* set as w3bNumber */
    }
    return ZERO_W3N;
  }, [totalToInvest]);

  const [investAPR, setInvestAPR] = useState<number>();
  const [borrowAPR, setBorrowAPR] = useState<number>();
  const [netAPR, setNetAPR] = useState<number>();

  const [investPosition, setInvestPosition] = useState<W3bNumber>();
  const [debtPosition, setDebtPosition] = useState<W3bNumber>();
  const [shortInvested, setShortInvested] = useState<W3bNumber>();
  const [shortBorrowed, setShortBorrowed] = useState<W3bNumber>();

  const [flashFee, setFlashFee] = useState<W3bNumber>();

  /* use STETH lever simulations */
  const stEthSim: leverSimulation = useStEthSim(inputAsFyToken, totalToInvest, toBorrow);
  useEffect(() => {
    if (
      // add in check here for if stratgey is steth
      stEthSim.investPosition &&
      stEthSim.debtPosition &&
      stEthSim.baseInvested &&
      stEthSim.baseBorrowed &&
      leverage.dsp &&
      selectedStrategy?.maturity
    ) {
      setInvestPosition(stEthSim.investPosition);
      setDebtPosition(stEthSim.debtPosition);
      setShortBorrowed(stEthSim.baseBorrowed);
      setShortInvested(stEthSim.baseInvested);

      const { netAPR, borrowAPR, investAPR } = calculateAPRs(
        stEthSim.investPosition,
        stEthSim.debtPosition,
        stEthSim.baseInvested,
        stEthSim.baseBorrowed,
        leverage.dsp,
        selectedStrategy?.maturity
      );
      setNetAPR(netAPR);
      setBorrowAPR(borrowAPR);
      setInvestAPR(investAPR);
    }
  }, [stEthSim, leverage, selectedStrategy]);


  const approve = async () => {
    if (selectedStrategy?.investTokenContract) {
      setAppState(AppState.Approving);
      const gasLimit = (
        await selectedStrategy.investTokenContract.estimateGas.approve(selectedStrategy.leverAddress, totalToInvest.big)
      ).mul(2);
      const tx = await selectedStrategy.investTokenContract.approve(selectedStrategy.leverAddress, totalToInvest.big);
      await tx.wait();
      setAppState(AppState.Transactable);
    }
  };

  const transact = async () => {
    if (selectedStrategy?.leverContract) {
      setAppState(AppState.Transacting);
      const gasLimit = (
        await selectedStrategy.leverContract.estimateGas.invest(selectedStrategy.seriesId, input.big, toBorrow.big, '0')
      ).mul(2);

      const investTx = await selectedStrategy.leverContract.invest(
        selectedStrategy.seriesId,
        input.big,
        toBorrow.big,
        '0',// removeSlippage( investPosition.big),
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

    // inputs
    totalToInvest,
    valueOfInvestment,
    toBorrow,
    inputAsFyToken,

    // simulations
    investPosition,
    debtPosition,
    shortBorrowed,
    shortInvested,
    flashFee,

    // APRs and calcs
    borrowAPR,
    investAPR,
    netAPR,

    slippage,
    setSlippage,
    changeSlippage,
    addSlippage,
    removeSlippage,
  };
};
