import { useContext, useEffect, useMemo, useState } from 'react';
import { buyBase, sellBase, sellFYToken, ZERO_BN } from '@yield-protocol/ui-math';
import { contractFactories, WETH_STETH_STABLESWAP } from '../../config/contractRegister';
import { W3bNumber } from '../../context/InputContext';

import { IPoolState, MarketContext } from '../../context/MarketContext';
import { convertToW3bNumber } from '../../lib/utils';
import { LeverContext } from '../../context/LeverContext';
// import { WETH_STETH_STABLESWAP, WST_ETH } from '../../contracts';
import { ZERO_W3N } from '../../constants';
import { LeverSimulation, simOutput } from '../useLever';
import useBlockTime from '../useBlockTime';
import { WST_ETH } from '../../contracts_';

import curve from '@curvefi/api';
import { ethers } from 'ethers';

export const useStEthSim = (input: W3bNumber, leverage: W3bNumber): simOutput => {
  const [leverState] = useContext(LeverContext);
  const [marketState]: [IPoolState] = useContext(MarketContext);
  const { selectedStrategy, selectedPosition, provider } = leverState;

  const { currentTime } = useBlockTime();

  const [ investAPY, setInvestApy ] = useState<string>();
  const [ investFee, setInvestFee ] = useState<string>();

  // CURVE infomation :
  useEffect(() => {
    (async () => {
      // await curve.init('JsonRpc', {}, { });
      await curve.init("Infura", { network: "homestead", apiKey: '2af222f674024a0f84b5f0aad0da72a2'}, { chainId: 1 });
      // --- STETH ---
      const steth = curve && curve.getPool('steth');
      // const vol = await steth.stats.volume();
      // console.log(vol);
      /*  Daily/weekly APY based on usage  */ 
      // const apy = await steth.stats.baseApy(); // { day: '3.1587592896017647', week: '2.6522145719060752' } (as %)
      // console.log(apy);
      /*  Token APY  */ 
      // const tokenApy = await steth.stats.tokenApy();
      // console.log(tokenApy);
      // [ '0.5918', '1.4796' ] ([min, max] as %) 
  
      /* StETH APY */ 
      const rewardsApy = await steth.stats.rewardsApy();
      setInvestApy(rewardsApy[0].apy.toString())
      // [
      //     {
      //         gaugeAddress: '0x182b723a58739a9c974cfdb385ceadb237453c28',
      //         tokenAddress: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
      //         tokenPrice: 1.023,
      //         name: 'Lido DAO Token',
      //         symbol: 'LDO',
      //         decimals: '18',
      //         apy: 2.6446376845647155 (annualised as %)
      //     }
      // ]
      const parameters = await steth.stats.parameters();
      setInvestFee(parameters.fee)
      // {
      //     lpTokenSupply: '66658430.461661546713781772',
      //     virtualPrice: '1.107067773320466717',
      //     fee: '0.04', // % ie. * 0.0004
      //     adminFee: '0.02',
      //     A: '4500',
      //     future_A: '4500',
      //     initial_A: undefined,
      //     future_A_time: undefined,
      //     initial_A_time: undefined,
      //     gamma: undefined
      // }
    })();
  },[])


  const now = Math.round(new Date().getTime() / 1000);
  const timeToMaturity = marketState.maturity - now;
  const yearProportion = (timeToMaturity / 31536000);

  // console.log(timeToMaturity); 

  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const inputAsFyToken: W3bNumber = useMemo(() => {
    if (input && input.big.gt(ZERO_BN)) {
      const fyTokens = sellBase(
        marketState.sharesReserves,
        marketState.fyTokenReserves,
        input.big,
        timeToMaturity.toString(),
        marketState.ts,
        marketState.g1,
        marketState.decimals
      );
      return convertToW3bNumber(fyTokens, 18, 6);
    }
    return ZERO_W3N;
  }, [input, marketState]);

  const totalToInvest: W3bNumber = useMemo(() => {
    if (inputAsFyToken.big.gt(ZERO_BN)) {
      const total_ = inputAsFyToken.big.mul(leverage!.big).div(100);
      return convertToW3bNumber(total_, 18, 6); /* set as w3bnumber  */
    }
    return ZERO_W3N;
  }, [inputAsFyToken, leverage]);

  const toBorrow: W3bNumber = useMemo(() => {
    if (inputAsFyToken) {
      const toBorrow_ = totalToInvest.big.sub(inputAsFyToken.big);
      return convertToW3bNumber(toBorrow_, 18, 6); /* set as w3bNumber */
    }
    return ZERO_W3N;
  }, [totalToInvest]);

  /**
   * Compute how much collateral would be generated by investing with these
   * parameters.
   */
  const simulateInvest = async (): Promise<any> => {
    const shortBorrowed = toBorrow;

    let debtAtMaturity = ZERO_W3N;
    let debtCurrent = ZERO_W3N;

    let shortInvested = ZERO_W3N;

    let investmentPosition = ZERO_W3N; 
    let investmentAtMaturity = ZERO_W3N; 
    let investmentCurrent = ZERO_W3N;

    let flashBorrowFee = ZERO_W3N;

    let investmentFee = ZERO_W3N;

    if (selectedStrategy && inputAsFyToken.big.gt(ZERO_BN)) {
      
      setIsSimulating(true);

      // - netInvestAmount = baseAmount + borrowAmount - fee
      // const fyWeth = await getFyToken(seriesId, contracts, account);
      const fyContract = selectedStrategy.investTokenContract;
      const fee = await fyContract.flashFee(fyContract.address, toBorrow.big.toString());
      flashBorrowFee = convertToW3bNumber(fee.toString(), 18, 6);

      /* calculate the resulting debt */
      const debt_ = buyBase(
        marketState.sharesReserves,
        marketState.fyTokenReserves,
        toBorrow.big,
        timeToMaturity.toString(),
        marketState.ts,
        marketState.g1,
        marketState.decimals
      );
      debtAtMaturity = convertToW3bNumber(debt_, 18, 6);

      // - sellFyWeth: FyWEth -> WEth
      // const obtainedWEth = await selectedStrategy.marketContract.sellFYTokenPreview(netInvestAmount);
      const netInvestAmount = inputAsFyToken.big.add(toBorrow.big); // .sub(fee); // - netInvestAmount = baseAmount + borrowAmount - fee
      const wethObtained = sellFYToken(
        marketState.sharesReserves,
        marketState.fyTokenReserves,
        netInvestAmount,
        timeToMaturity.toString(),
        marketState.ts,
        marketState.g1,
        marketState.decimals
      );

      shortInvested = convertToW3bNumber(wethObtained, 18, 6);


      investmentFee = convertToW3bNumber(shortInvested.big.mul(4).div(10000), 18, 6);

      // stableSwap exchange: WEth -> StEth
      const stableSwap = contractFactories[WETH_STETH_STABLESWAP].connect(WETH_STETH_STABLESWAP, provider);
      const boughtStEth = await stableSwap.get_dy(0, 1, wethObtained);

      // investPosition (stEth held)
      investmentPosition = convertToW3bNumber(boughtStEth, 18, 6);

      /* added rewards */ 
      const rewards = parseFloat(investAPY || '0')*(yearProportion);
      const returns = ethers.utils.parseEther( ( investmentPosition.dsp*(  1 + rewards/100 )).toString() );  
      const returnsLessFees = returns.sub(investmentFee.big);

      // const stEthPlusReturns = boughtStEth.mul(returns)
      investmentAtMaturity = convertToW3bNumber(returnsLessFees, 18, 6);

      // - Wrap: StEth -> WStEth
      // const wStEthContract = contractFactories[WST_ETH].connect(WST_ETH, provider);
      // const investPosition_ = await wStEthContract.getWstETHByStETH(boughtStEth);
      // console.log( 'WrappedStETH : ',  investPosition_.toString() )
      // check unwrapping */
      // const oneStEth = ethers.utils.parseUnits('1');
      // const stEthPerWrapped = await wStEthContract.getStETHByWstETH(oneStEth);
      // const unwrappedStEthValue = boughtStEth.mul(stEthPerWrapped).div(oneStEth);
      // const unwrappedStEthValue = await wStEthContract.getStETHByWstETH(boughtStEth);
      // console.log(stEthPerWrapped.toString());
      // console.log('UNWRAPEED STEEHT : ', unwrappedStEthValue.toString());

      /* check for anywswapping cost */
      /* Calculate the value of the investPosition in short terms : via swap */
      const investValue_ = await stableSwap.get_dy(1, 0, boughtStEth);

      investmentCurrent = convertToW3bNumber(investValue_, 18, 6);

    }

    setIsSimulating(false);

    return {

      shortBorrowed,  
      debtAtMaturity,
      debtCurrent,

      flashBorrowFee,

      shortInvested,
      investmentPosition,
      investmentAtMaturity,
      investmentCurrent,

      investmentFee,

    };
  };

  /**
   * Compute how much short asset ( WEth ) the user has at the end of the operation. Currently and at Maturity.
   */
  const simulateReturn = async (): Promise<W3bNumber> => {
    
    setIsSimulating(true);

    const fyContract = selectedStrategy.investTokenContract;
    const wStEthContract = contractFactories[WST_ETH].connect(WST_ETH, provider);
    const pool = selectedStrategy.poolContract;
    const stableSwap = contractFactories[WETH_STETH_STABLESWAP].connect(WETH_STETH_STABLESWAP, provider);

    if (selectedStrategy && selectedPosition) {
      /* amount of steth recieved from unwrapping wSTETH */
      const stEthUnwrapped = await wStEthContract.getStETHByWstETH(selectedPosition.ink);

      /* Amount of Eth from swapping stETH on curve */
      const wethReceived = await stableSwap.get_dy(1, 0, stEthUnwrapped);

      /* Add in any fee for flashBorrowing */
      const fee = await fyContract.flashFee(fyContract.address, selectedPosition.art);
      const borrowAmountPlusFee = fee.add(selectedPosition.art);

      const wethToTransfer = await pool.buyFYTokenPreview(borrowAmountPlusFee);
      const wethRemaining = wethReceived.sub(wethToTransfer);

      console.log('Weth returned: ', wethRemaining.toString());
      // const wethRemaining = ZERO_BN;

      setIsSimulating(false);

      return convertToW3bNumber(wethRemaining, 18, 6);

    } else {
      // Past maturity, we close.
      // const cauldron = getContract(CAULDRON, contracts, account);
      // // `debtToBase` is not view, so we need to compute it ourselves
      // const base = await cauldron.callStatic.debtToBase(
      //   vault.seriesId,
      //   balance.art
      // );
      // const stEthUnwrapped = await wStEth.getStETHByWstETH(balance.ink);
      // const weth = await stableSwap.get_dy(1, 0, stEthUnwrapped);
      // const wethJoin = getContract(WETH_JOIN, contracts, account);
      // const fee = await wethJoin.flashFee(WETH, base);
      console.log('TODO: handle post maturity!');
      setIsSimulating(false);
      return ZERO_W3N;
    }
  };

  return { simulateReturn, simulateInvest, isSimulating, notification: [], extraBucket: [] };
};
