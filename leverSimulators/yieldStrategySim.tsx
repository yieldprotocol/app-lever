import {
  burn,
  burnFromStrategy,
  buyBase,
  fyTokenForMint,
  sellBase,
  sellFYToken,
  ZERO_BN,
} from '@yield-protocol/ui-math';
import { IInputContextState } from '../context/InputContext';
import { ILeverContextState } from '../context/LeverContext';
import { ZERO_W3N } from '../constants';
import { Simulator, SimulatorOutput } from '../hooks/useLever';
import { IMarketContextState } from '../context/MarketContext';
import { IPositionContextState } from '../context/PositionContext';
import { Operation, Provider, W3bNumber } from '../lib/types';
import { convertToW3bNumber } from '../lib/utils';
import { BigNumber, ethers } from 'ethers';

// import { YieldStrategyLever__factory} from '../contracts/types';

/* Swap contract */
export const STRATEGY_ORACLE = '0x3EA4618cE652eaB330F00935FD075F5Cb614e689';

const getStrategyInfo = async (): Promise<[string, BigNumber]> => {
  const investApy = '3.3';
  const investFee = ZERO_BN;
  return [investApy, investFee];
};

export const yieldStrategySimulator: Simulator = async (
  inputState: IInputContextState,
  leverState: ILeverContextState,
  marketState: IMarketContextState,
  positionState: IPositionContextState,
  provider: Provider | undefined,
  existingPositionSim: boolean = false,
  currentTime: number = Math.round(new Date().getTime() / 1000)
): Promise<SimulatorOutput | undefined> => {
  const output = {} as SimulatorOutput;

  const input = inputState.input || ZERO_W3N;
  const leverage = inputState.leverage;
  const selectedPosition = positionState.selectedPosition;

  const { selectedLever, assets } = leverState;
  const shortAsset = assets.get(selectedLever?.baseId!);
  const longAsset = assets.get(selectedLever?.ilkId!);

  const timeToMaturity = marketState.maturity - currentTime;
  const yearProportion = timeToMaturity / 31536000;

  if (!existingPositionSim && input?.big.gt(ZERO_BN)) {

     /* try the simulation, catch any unknown errors */
     console.log('Running STRATEGY Lever simulator...');

    const [investApy, investFee] = await getStrategyInfo();

    output.shortAssetInput = convertToW3bNumber(input.big, 18, 3);

    /**
     * output.shortAssetBorrowed
     * */
    const inputAsFyToken_ = sellBase(
      marketState.sharesReserves,
      marketState.fyTokenReserves,
      input.big,
      timeToMaturity.toString(),
      marketState.ts,
      marketState.g1,
      marketState.decimals
    );
    const inputAsFyToken: W3bNumber = input?.big.gt(ZERO_BN)
      ? convertToW3bNumber(inputAsFyToken_, shortAsset?.decimals, shortAsset?.displayDigits)
      : ZERO_W3N;

    const totalFytoken_ = inputAsFyToken.big.mul(leverage!.big).div(100);
    const totalFytoken: W3bNumber = inputAsFyToken.big.gt(ZERO_BN)
      ? convertToW3bNumber(totalFytoken_, shortAsset?.decimals, shortAsset?.displayDigits)
      : ZERO_W3N;

    const borrowAmount_ = totalFytoken.big.sub(inputAsFyToken.big);
    const borrowAmount: W3bNumber = inputAsFyToken
      ? convertToW3bNumber(borrowAmount_, shortAsset?.decimals, shortAsset?.displayDigits)
      : ZERO_W3N;

    output.shortAssetBorrowed = borrowAmount;

    /**
     * output.shortAssetObtained
     * */
    const netFytoken = totalFytoken.big; // .sub(fee);  //  netFytoken = baseAmount + borrowAmount - flash fee
    const shortObtained_ = sellFYToken(
      marketState.sharesReserves,
      marketState.fyTokenReserves,
      netFytoken,
      timeToMaturity.toString(),
      marketState.ts,
      marketState.g1,
      marketState.decimals
    );
    output.shortAssetObtained = convertToW3bNumber(shortObtained_, shortAsset?.decimals, shortAsset?.displayDigits);

    /**
     * output.flashBorrowFee
     * */
    output.flashBorrowFee = ZERO_W3N; // zero flash borrow fees for now.

    /**
     * output.debtAtMaturity  - Debt resulting from the amount borrowed
     * */
    const debtAtMaturity_ = buyBase(
      marketState.sharesReserves,
      marketState.fyTokenReserves,
      borrowAmount.big,
      timeToMaturity.toString(),
      marketState.ts,
      marketState.g1,
      marketState.decimals
    );
    output.debtAtMaturity = convertToW3bNumber(debtAtMaturity_, shortAsset?.decimals, shortAsset?.displayDigits);

    /**
     * output.tradingFee
     * */
    output.tradingFee = convertToW3bNumber(investFee, shortAsset?.decimals, shortAsset?.displayDigits);
    output.tradingFee = ZERO_W3N;

    /**
     * output.longAssetObtained
     * */
    const [lpTokens, returned] = fyTokenForMint(
      marketState.sharesReserves,
      marketState.fyTokenRealReserves,
      marketState.fyTokenReserves,
      netFytoken,
      timeToMaturity.toString(),
      marketState.ts,
      marketState.g1,
      marketState.decimals
    );
    output.longAssetObtained = convertToW3bNumber(lpTokens, longAsset?.decimals, longAsset?.displayDigits);

    /**
     * output.investmentAtMaturity
     * */
    const rewards = parseFloat(investApy || '0') * yearProportion;
    const returns = (output.longAssetObtained.dsp * (1 + rewards / 100)).toFixed(longAsset!.decimals);
    const estimatedReturns = ethers.utils.parseUnits(returns, longAsset!.decimals);
    const returnsLessFees = estimatedReturns.sub(output.tradingFee.big);
    output.investmentAtMaturity = convertToW3bNumber(returnsLessFees, longAsset!.decimals, longAsset!.displayDigits);

    const lpReceived = burnFromStrategy(marketState.totalSupply, marketState.totalSupply, lpTokens);
    const [sharesReceivedFromBurn, fyTokenReceivedFromBurn] = burn(
      marketState.sharesReserves,
      marketState.fyTokenRealReserves,
      marketState.totalSupply,
      lpReceived
    );
    output.investmentCurrent = convertToW3bNumber(
      sharesReceivedFromBurn.add(fyTokenReceivedFromBurn),
      shortAsset?.decimals,
      shortAsset?.displayDigits
    );

    /** INVEST : 
        Operation operation,
        bytes6 seriesId,
        bytes6 strategyId,
        uint256 amountToInvest,
        uint256 borrowAmount,
        uint256 fyTokenToBuy,
        uint256 minCollateral
    */
    output.investArgs = selectedLever
      ? [
          Operation.BORROW,
          selectedLever.seriesId,
          selectedLever.ilkId,
          input.big, // amount user added (eg USDC)
          output.shortAssetBorrowed.big, // extra borrow required
          output.shortAssetObtained.big, // fyToken required to buy for the borrow      //  totalFytoken
          ZERO_BN,
        ]
      : [];

      console.log( output )
      return output;
  }

  /* Handle the simulation for an existing posiiton/vault */
  if (existingPositionSim && selectedPosition) {
    /* try the simulation, catch any unknown errors */
    console.log('Running STRATEGY Lever POSITION simulator...');

    /* get the curve info */
    const [investApy, investFee] = await getStrategyInfo();
    output.tradingFee = convertToW3bNumber(investFee, 18, 3);

    output.shortAssetInput = selectedPosition.shortAssetObtained;
    output.shortAssetInput = selectedPosition.shortAssetInput;
    output.longAssetObtained = selectedPosition.longAssetObtained;
    output.shortAssetObtained = selectedPosition.shortAssetObtained;
    output.debtAtMaturity = selectedPosition.debtAtMaturity;
    output.shortAssetBorrowed = selectedPosition.shortAssetBorrowed;

    const timeToMaturity = marketState.maturity - currentTime;
    const yearProportion = timeToMaturity / 31536000;

    /* Added rewards */
    const rewards = parseFloat(investApy || '0') * yearProportion;
    const returns = ethers.utils.parseEther((selectedPosition.longAssetObtained.dsp * (1 + rewards / 100)).toString());
    const returnsLessFees = returns.sub(investFee);

    // const stEthPlusReturns = boughtStEth.mul(returns)
    output.investmentAtMaturity = convertToW3bNumber(returnsLessFees, 18, 3);

    /* Calculate the value of the investPosition in short terms : via swap */

    // const investValue_ = await stableSwap.get_dy(1, 0, selectedPosition.longAssetObtained.big); // .catch(()=>{console.log('failed'); return ZERO_BN} );
    // const investValueLessFees = investValue_.sub(investFee);
    // output.investmentCurrent = convertToW3bNumber(investValueLessFees, 18, 3);


    /** DIVEST :
      Operation operation,
      bytes12 vaultId,
      bytes6 seriesId,
      bytes6 strategyId,
      uint256 ink,
      uint256 art,
      uint256 minBaseOut
    */
    output.divestArgs = selectedPosition
      ? [
          Operation.CLOSE,
          selectedPosition.vaultId,
          selectedPosition.seriesId,
          selectedPosition.ilkId,
          selectedPosition.longAssetObtained.big,
          selectedPosition.shortAssetBorrowed.big,
          ZERO_BN,
        ]
      : [];

    console.log('DiVEST OUTPUT', output);
    return output;
  }
};
