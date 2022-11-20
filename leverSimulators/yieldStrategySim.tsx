import { ZERO_BN } from '@yield-protocol/ui-math';
import { IInputContextState } from '../context/InputContext';
import { ILeverContextState } from '../context/LeverContext';
import { ZERO_W3N } from '../constants';
import { NULL_OUTPUT, Simulator, SimulatorOutput } from '../hooks/useLever';
import { IMarketContextState } from '../context/MarketContext';
import { IPositionContextState } from '../context/PositionContext';
import { Provider } from '../lib/types';

// import { YieldStrategyLever__factory} from '../contracts/types';

/* Swap contract */
// export const WETH_STETH_STABLESWAP = '0x828b154032950c8ff7cf8085d841723db2696056';

/**
 Reference simoutput requirements: 
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
*/

export const strategySimulator: Simulator = async (
  inputState: IInputContextState,
  leverState: ILeverContextState,
  marketState: IMarketContextState,
  positionState: IPositionContextState,
  provider: Provider | undefined,
  currentTime: number = Math.round(new Date().getTime() / 1000)
): Promise<SimulatorOutput | undefined> => {
  const output = NULL_OUTPUT;

  const input = inputState.input || ZERO_W3N;
  const leverage = inputState.leverage;
  const lever = leverState.selectedLever;

  if (input.big.gt(ZERO_BN) && provider) {
    console.log('Fired STRATEGY LEVER....');

    /**
     * CURVE infomation:
     * */
    // await curve.init('Infura', { network: 'homestead', apiKey: '2af222f674024a0f84b5f0aad0da72a2' }, { chainId: 1 });

    // /* StETH APY */
    // const steth = curve && curve.getPool('steth');
    // const rewardsApy = await steth.stats.rewardsApy();
    // const investAPY = rewardsApy[0].apy.toString();
    // const parameters = await steth.stats.parameters();
    // const investFee = parameters.fee;

    // const timeToMaturity = marketState.maturity - currentTime;
    // const yearProportion = timeToMaturity / 31536000;

    // const inputAsFyToken_ = sellBase(
    //   marketState.sharesReserves,
    //   marketState.fyTokenReserves,
    //   input.big,
    //   timeToMaturity.toString(),
    //   marketState.ts,
    //   marketState.g1,
    //   marketState.decimals
    // );
    // const inputAsFyToken: W3bNumber = input?.big.gt(ZERO_BN) ? convertToW3bNumber(inputAsFyToken_, 18, 6) : ZERO_W3N;

    // const totalToInvest_ = inputAsFyToken.big.mul(leverage!.big).div(100);
    // const totalToInvest: W3bNumber = inputAsFyToken.big.gt(ZERO_BN)
    //   ? convertToW3bNumber(totalToInvest_, 18, 6)
    //   : ZERO_W3N;

    // const toBorrow_ = totalToInvest.big.sub(inputAsFyToken.big);
    // const toBorrow: W3bNumber = inputAsFyToken ? convertToW3bNumber(toBorrow_, 18, 6) : ZERO_W3N;

    // /**
    //  * Compute how much collateral would be generated by investing with these parameters.
    //  */
    // if (inputAsFyToken.big.gt(ZERO_BN)) {
    //   // - netInvestAmount = baseAmount + borrowAmount - fee
    //   // const fyWeth = await getFyToken(seriesId, contracts, account);
    //   const fyContract = lever?.investTokenContract;
    //   const fee = ZERO_BN; //  await fyContract.flashFee(fyContract.address, toBorrow.big.toString()) ;

    //   output.flashBorrowFee = convertToW3bNumber(fee, 18, 6);

    //   /* calculate the resulting debt */
    //   const debt_ = buyBase(
    //     marketState.sharesReserves,
    //     marketState.fyTokenReserves,
    //     toBorrow.big,
    //     timeToMaturity.toString(),
    //     marketState.ts,
    //     marketState.g1,
    //     marketState.decimals
    //   );
    //   output.debtAtMaturity = convertToW3bNumber(debt_, 18, 6);

    //   // - sellFyWeth: FyWEth -> WEth
    //   // const obtainedWEth = await selectedLever.marketContract.sellFYTokenPreview(netInvestAmount);
    //   const netInvestAmount = inputAsFyToken.big.add(toBorrow.big); // .sub(fee); // - netInvestAmount = baseAmount + borrowAmount - fee
    //   const wethObtained = sellFYToken(
    //     marketState.sharesReserves,
    //     marketState.fyTokenReserves,
    //     netInvestAmount,
    //     timeToMaturity.toString(),
    //     marketState.ts,
    //     marketState.g1,
    //     marketState.decimals
    //   );

    //   output.shortBorrowed = toBorrow;
    //   output.shortInvested = convertToW3bNumber(wethObtained, 18, 6);
    //   output.investmentFee = convertToW3bNumber(output.shortInvested.big.mul(4).div(10000), 18, 6);

    //   const stableSwap = StableSwap__factory.connect(WETH_STETH_STABLESWAP, provider)
    //   const boughtStEth = await stableSwap.get_dy(0, 1, wethObtained); // .catch(()=>{console.log('too big'); return ZERO_BN} );

    //   // investPosition (stEth held)
    //   output.investmentPosition = convertToW3bNumber(boughtStEth, 18, 6);

    //   /* added rewards */
    //   const rewards = parseFloat(investAPY || '0') * yearProportion;
    //   const returns = ethers.utils.parseEther((output.investmentPosition.dsp * (1 + rewards / 100)).toString());
    //   const returnsLessFees = returns.sub(output.investmentFee.big);

    //   // const stEthPlusReturns = boughtStEth.mul(returns)
    //   output.investmentAtMaturity = convertToW3bNumber(returnsLessFees, 18, 6);

    //   /* check for any swapping costs */
    //   /* Calculate the value of the investPosition in short terms : via swap */
    //   const investValue_ = await stableSwap.get_dy(1, 0, boughtStEth) // .catch(()=>{console.log('failed'); return ZERO_BN} );
    //   const investValueLessFees = investValue_.sub(output.investmentFee.big)
    //   output.investmentCurrent = convertToW3bNumber(investValueLessFees, 18, 6);
    // }
  }

  output.investArgs = [lever?.seriesId, input.big, ZERO_BN];
  output.divestArgs = [lever?.seriesId, input.big, ZERO_BN];

  return output;
};