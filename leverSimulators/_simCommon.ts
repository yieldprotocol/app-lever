import { buyBase, fyTokenForMint, sellBase, sellFYToken, ZERO_BN } from '@yield-protocol/ui-math';
import { IInputContextState } from '../context/InputContext';

import { convertToW3bNumber } from '../lib/utils';
import { IAsset, ILever, ILeverContextState, ILeverPosition } from '../context/LeverContext';

import { ZERO_W3N } from '../constants';

import { IMarketContextState } from '../context/MarketContext';
import { IPositionContextState, PositionStatus } from '../context/PositionContext';
import { Provider, W3bNumber } from '../lib/types';
import { SimulatorOutput } from '../hooks/useLever';

const blankSimOutput: SimulatorOutput = {
  debtCurrent: ZERO_W3N,
  debtAtMaturity: ZERO_W3N,
  shortAssetInput: ZERO_W3N,
  shortAssetBorrowed: ZERO_W3N,
  shortAssetObtained: ZERO_W3N,
  longAssetObtained: ZERO_W3N,
  investmentAtMaturity: ZERO_W3N,
  investmentValue: ZERO_W3N,
  tradingFee: ZERO_W3N,
  flashBorrowFee: ZERO_W3N,
  investArgs: [],
  divestArgs: [],
  notification: undefined,
};

export interface ISimCommonFragment {
  shortAssetInput: W3bNumber;
  debtAtMaturity: W3bNumber;
  shortAssetBorrowed: W3bNumber;
  shortAssetObtained: W3bNumber;
  flashBorrowFee: W3bNumber;

  input: W3bNumber | undefined;
  leverage: W3bNumber | undefined;
  selectedLever: ILever | undefined;
  selectedPosition: any;

  shortAsset: IAsset | undefined;
  longAsset: IAsset | undefined;

  yearProportion: number;
  timeToMaturity: number;

  _blankSimOutput: SimulatorOutput;
}

export const _simCommon = async (
  inputState: IInputContextState,
  leverState: ILeverContextState,
  marketState: IMarketContextState,
  positionState: IPositionContextState,
  // provider: Provider,
  // existingPositionSim: boolean = false,
  currentTime: number = Math.round(new Date().getTime() / 1000)
): Promise<ISimCommonFragment> => {
  
  const input = inputState.input;
  const leverage = inputState.leverage;
  const selectedLever = leverState.selectedLever;
  const selectedPosition = positionState.selectedPosition;
  const timeToMaturity = marketState.maturity - currentTime;
  const yearProportion = timeToMaturity / 31536000;
  const shortAsset = leverState.assets.get(selectedLever!.baseId);
  const longAsset = leverState.assets.get(selectedLever!.ilkId);

  /* format input */
  const shortAssetInput = convertToW3bNumber(input!.big, shortAsset?.decimals, shortAsset?.displayDigits);

  /* Calculate the fyToken value of the base added (input) */
  const inputAsFyToken_ = sellBase(
    marketState.sharesReserves,
    marketState.fyTokenReserves,
    input!.big,
    timeToMaturity.toString(),
    marketState.ts,
    marketState.g1,
    marketState.decimals
  );

  /* Check if trade is Possible */
  // if (inputAsFyToken_.eq(ZERO_BN)) throw {type: NotificationType.ERROR, msg: 'Unsupported trade'};
  const inputAsFyToken: W3bNumber = input?.big.gt(ZERO_BN)
    ? convertToW3bNumber(inputAsFyToken_, shortAsset?.decimals, shortAsset?.displayDigits)
    : ZERO_W3N;

  /* Calculate the required total fytoken investment from the leverage */
  const totalFyToken_ = inputAsFyToken.big.mul(leverage!.big).div(100);
  const totalFyToken: W3bNumber = inputAsFyToken.big.gt(ZERO_BN)
    ? convertToW3bNumber(totalFyToken_, shortAsset?.decimals, shortAsset?.displayDigits)
    : ZERO_W3N;

  /* Calculate the extra amount needed to be borrowed to get to the required fytoken investmeent */
  const borrowAmount_ = totalFyToken.big.sub(inputAsFyToken.big);
  const borrowAmount: W3bNumber = inputAsFyToken
    ? convertToW3bNumber(borrowAmount_, shortAsset?.decimals, shortAsset?.displayDigits)
    : ZERO_W3N;
  const shortAssetBorrowed = borrowAmount;

  /**
   * Compute how much collateral would be generated by investing with these parameters.
   */
  // const fyContract = selectedLever?.fyTokenContract;
  const fee = ZERO_BN; //  await fyContract.flashFee(fyContract.address, toBorrow.big.toString()) ;
  const flashBorrowFee = convertToW3bNumber(fee, shortAsset?.decimals, shortAsset?.displayDigits);

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
  const shortAssetObtained = convertToW3bNumber(shortObtained_, shortAsset?.decimals, shortAsset?.displayDigits);

  /* Calculate the resulting debt from the amount borrowed */
  const debtAtMaturity_ = buyBase(
    marketState.sharesReserves,
    marketState.fyTokenReserves,
    shortAssetBorrowed.big,
    timeToMaturity.toString(),
    marketState.ts,
    marketState.g1,
    marketState.decimals
  );

  const debtAtMaturity = convertToW3bNumber(debtAtMaturity_, shortAsset?.decimals, shortAsset?.displayDigits);

  return {
    input,
    leverage,

    selectedLever,
    selectedPosition,

    yearProportion,
    timeToMaturity,

    shortAssetInput,
    debtAtMaturity,
    shortAssetBorrowed,
    shortAssetObtained,
    flashBorrowFee,

    shortAsset,
    longAsset,

    _blankSimOutput: blankSimOutput,
  };
};