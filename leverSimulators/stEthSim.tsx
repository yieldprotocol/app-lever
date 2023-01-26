import { buyBase, sellBase, sellFYToken, ZERO_BN } from '@yield-protocol/ui-math';
import { IInputContextState } from '../context/InputContext';

import { convertToW3bNumber } from '../lib/utils';
import { ILeverContextState } from '../context/LeverContext';

import { ZERO_W3N } from '../constants';
import { SimulatorOutput, Simulator } from '../hooks/useLever';

import curve from '@curvefi/api';
import { BigNumber, ethers } from 'ethers';

import { StableSwap__factory } from '../contracts/types';
import { IMarketContextState } from '../context/MarketContext';
import { IPositionContextState, PositionStatus } from '../context/PositionContext';
import { Provider, W3bNumber } from '../lib/types';

/* Stable Swap Contract */
export const STETH_STABLESWAP = '0x828b154032950c8ff7cf8085d841723db2696056';

/**
 * CURVE API interaction:
 * */
const getCurveProtocolInfo = async (): Promise<[string, BigNumber]> => {
  
  console.log( 'Waiting for curve...')
  await curve.init('Infura', { network: 'homestead', apiKey: '2af222f674024a0f84b5f0aad0da72a2' }, { chainId: 1 });
  console.log( 'curve connection initiated.' );
  
  /* StETH APY */
  console.log( 'Getting curve data...' );
  const steth = curve && curve.getPool('steth');
  const rewardsApy = await steth.stats.rewardsApy();
  const investApy = rewardsApy[0].apy.toString();
  const parameters = await steth.stats.parameters();
  const investFee = ethers.utils.parseUnits(parameters.fee, '18');
  
  return [investApy, investFee];
};

export const stEthSimulator: Simulator = async (
  inputState: IInputContextState,
  leverState: ILeverContextState,
  marketState: IMarketContextState,
  positionState: IPositionContextState,
  provider: Provider,
  existingPositionSim: boolean = false,
  currentTime: number = Math.round(new Date().getTime() / 1000)
): Promise<SimulatorOutput | undefined> => {

  const input = inputState.input;
  const leverage = inputState.leverage;
  const selectedLever = leverState.selectedLever;
  const selectedPosition = positionState.selectedPosition;

  const stableSwap = StableSwap__factory.connect(STETH_STABLESWAP, provider);

  const timeToMaturity = marketState.maturity - currentTime;
  const yearProportion = timeToMaturity / 31536000;

  if (!existingPositionSim && input?.big.gt(ZERO_BN)) {

    /* try the simulation, catch any unknown errors */
    console.log('Running STETH Lever simulator....');
    const output = {} as SimulatorOutput;

    /* get the curve info */
    const [investApy, investFee] = await getCurveProtocolInfo();
    output.tradingFee = convertToW3bNumber(investFee, 18, 3);

    output.shortAssetInput = convertToW3bNumber(input.big, 18, 3);

    /* Calculate the fyToken value of the base added (input) */
    const inputAsFyToken_ = sellBase(
      marketState.sharesReserves,
      marketState.fyTokenReserves,
      input.big,
      timeToMaturity.toString(),
      marketState.ts,
      marketState.g1,
      marketState.decimals
    );

    /* Check if trade is Possible */
    // if (inputAsFyToken_.eq(ZERO_BN)) throw {type: NotificationType.ERROR, msg: 'Unsupported trade'};
    const inputAsFyToken: W3bNumber = input?.big.gt(ZERO_BN) ? convertToW3bNumber(inputAsFyToken_, 18, 3) : ZERO_W3N;

    /* Calculate the required total fytoken investment from the leverage */
    const totalFyToken_ = inputAsFyToken.big.mul(leverage!.big).div(100);
    const totalFyToken: W3bNumber = inputAsFyToken.big.gt(ZERO_BN)
      ? convertToW3bNumber(totalFyToken_, 18, 3)
      : ZERO_W3N;

    /* Calculate the extra amount needed to be borrowed to get to the required fytoken investmeent */
    const borrowAmount_ = totalFyToken.big.sub(inputAsFyToken.big);
    const borrowAmount: W3bNumber = inputAsFyToken ? convertToW3bNumber(borrowAmount_, 18, 3) : ZERO_W3N;

    output.shortAssetBorrowed = borrowAmount;

    /**
     * Compute how much collateral would be generated by investing with these parameters.
     */
    const fyContract = selectedLever?.fyTokenContract;
    const fee = ZERO_BN; //  await fyContract.flashFee(fyContract.address, toBorrow.big.toString()) ;
    output.flashBorrowFee = convertToW3bNumber(fee, 18, 3);

    /* Calculate the total investment after selling all accumulated FyWEth for base */
    const netFytoken = totalFyToken.big.sub(fee); // netFytoken = baseAmount + borrowAmount - flash fee
    const shortObtained_ = sellFYToken(
      marketState.sharesReserves,
      marketState.fyTokenReserves,
      netFytoken,
      timeToMaturity.toString(),
      marketState.ts,
      marketState.g1,
      marketState.decimals
    );
    output.shortAssetObtained = convertToW3bNumber(shortObtained_, 18, 3);

    /* Calculate the resulting debt from the amount borrowed */
    const debtAtMaturity_ = buyBase(
      marketState.sharesReserves,
      marketState.fyTokenReserves,

      output.shortAssetBorrowed.big,

      timeToMaturity.toString(),
      marketState.ts,
      marketState.g1,
      marketState.decimals
    );
    output.debtAtMaturity = convertToW3bNumber(debtAtMaturity_, 18, 3);

    /* Investment */
    const boughtStEth = await stableSwap.get_dy(0, 1, output.shortAssetObtained.big); // .catch(()=>{console.log('too big'); return ZERO_BN} );

    // investPosition (stEth held)
    output.longAssetObtained = convertToW3bNumber(boughtStEth, 18, 3);

    /* Added rewards */
    const rewards = parseFloat(investApy) * yearProportion;
    const returns = ethers.utils.parseEther((output.longAssetObtained.dsp * (1 + rewards / 100)).toString());
    const returnsLessFees = returns // .sub(output.tradingFee.big);

    // const stEthPlusReturns = boughtStEth.mul(returns)
    output.investmentAtMaturity = convertToW3bNumber(returnsLessFees, 18, 3);

    /* Calculate the value of the investPosition in short terms : via swap */
    const investValue_ = await stableSwap.get_dy(1, 0, output.investmentAtMaturity.big); // .catch(()=>{console.log('failed'); return ZERO_BN} );
    const investValueLessFees = investValue_ // .sub(output.tradingFee.big);
    
    output.investmentValue = convertToW3bNumber(investValueLessFees, 18, 3);

    /**
     * INVEST ARGS :
     * bytes6 seriesId, // series id
     * uint256 baseAmount, // base amount added
     * uint256 borrowAmount,  // extra base required
     * uint256 minWeth  // minCollateral to end up with
     * */
    output.investArgs =
      selectedLever && input?.big.gt(ZERO_BN) && output.shortAssetBorrowed?.big.gt(ZERO_BN)
        ? [selectedLever.seriesId, input.big, output.shortAssetBorrowed.big, ZERO_BN]
        : [];

    console.log('INVEST OUTPUT', output);

    return output;
  }

  /* Handle the simulation for an existing posiiton/vault */
  if (existingPositionSim && selectedPosition?.status === PositionStatus.ACTIVE) {
    
    /* try the simulation, catch any unknown errors */
    console.log('Running STETH Lever POSITION simulator....');
    const output = {} as SimulatorOutput;

    /* get the curve info */
    const [investApy, investFee] = await getCurveProtocolInfo();
    output.tradingFee = convertToW3bNumber(investFee, 18, 3);

    output.longAssetObtained = selectedPosition.longAssetObtained;
    output.shortAssetObtained = selectedPosition.shortAssetObtained;
    output.shortAssetInput = selectedPosition.shortAssetObtained;
    output.debtAtMaturity = selectedPosition.debtAtMaturity;
    output.shortAssetBorrowed = selectedPosition.shortAssetBorrowed;

    const timeToMaturity = marketState.maturity - currentTime;
    const yearProportion = timeToMaturity / 31536000;

    /* Added rewards */
    const rewards = parseFloat(investApy || '0') * yearProportion;
    const returns = ethers.utils.parseEther((selectedPosition.longAssetObtained.dsp * (1 + rewards / 100)).toString());

    console.log( selectedPosition.longAssetObtained.big.toString()  ); 
    console.log( returns.toString()  ); 

    const returnsLessFees = returns.sub(investFee);

    // const stEthPlusReturns = boughtStEth.mul(returns)
    output.investmentAtMaturity = convertToW3bNumber(returnsLessFees, 18, 3);

    /* Calculate the value of the investPosition in short terms : via swap */
    const investValue_ = await stableSwap.get_dy(1, 0, output.investmentAtMaturity.big); // .catch(()=>{console.log('failed'); return ZERO_BN} );
    const investValueLessFees = investValue_// .sub(investFee);
    output.investmentValue = convertToW3bNumber(investValueLessFees, 18, 3);

    /**
     * DIVEST ARGS:
     * bytes12 vaultId,
     * bytes6 seriesId,
     * uint256 ink,
     * uint256 art,
     * uint256 minWeth
     * */
    output.divestArgs = selectedPosition
      ? [
          selectedPosition.vaultId,
          selectedPosition.seriesId,
          selectedPosition.ink.big,
          selectedPosition.art.big,
          ZERO_BN,
        ]
      : [];

    console.log('DiVEST OUTPUT', output);
    return output;
  }

};
