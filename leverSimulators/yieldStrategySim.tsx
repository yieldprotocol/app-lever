import { buyBase, sellBase, sellFYToken, ZERO_BN } from '@yield-protocol/ui-math';
import { IInputContextState } from '../context/InputContext';
import { ILeverContextState } from '../context/LeverContext';
import { ZERO_W3N } from '../constants';
import { Simulator, SimulatorOutput } from '../hooks/useLever';
import { IMarketContextState } from '../context/MarketContext';
import { IPositionContextState } from '../context/PositionContext';
import { Operation, Provider, W3bNumber } from '../lib/types';
import { convertToW3bNumber } from '../lib/utils';

// import { YieldStrategyLever__factory} from '../contracts/types';

/* Swap contract */
// export const WETH_STETH_STABLESWAP = '0x828b154032950c8ff7cf8085d841723db2696056';
export const STRATEGY_ORACLE = '0x3EA4618cE652eaB330F00935FD075F5Cb614e689';

export const yieldStrategySimulator: Simulator = async (
  inputState: IInputContextState,
  leverState: ILeverContextState,
  marketState: IMarketContextState,
  positionState: IPositionContextState,
  provider: Provider | undefined,
  currentTime: number = Math.round(new Date().getTime() / 1000)
): Promise<SimulatorOutput | undefined> => {

  const output = {} as SimulatorOutput;
  
  const input = inputState.input || ZERO_W3N;
  const leverage = inputState.leverage;
  const selectedPosition = positionState.selectedPosition;

  const { selectedLever, assets } = leverState;

  const timeToMaturity = marketState.maturity - currentTime;
  // const yearProportion = timeToMaturity / 31536000;
  const shortAsset = assets.get(selectedLever?.baseId!);

  // console.log( input.dsp, leverage.dsp )
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

  if (input.big.gt(ZERO_BN) && provider) {
    console.log('Fired STRATEGY LEVER....');
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

    output.shortAssetBorrowed = borrowAmount;
    output.shortAssetObtained = convertToW3bNumber(shortObtained_, shortAsset?.decimals, shortAsset?.displayDigits);

    /* Calculate the resulting debt from the amount borrowed */
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
    output.investmentFee = convertToW3bNumber(
      output.shortAssetObtained.big.mul(4).div(10000),
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
          // "0x303030380000",
          // "0x333500000000",
          // '10000000000000000000000',
          // '10000000000000000000000',
          // '10000000000000000000000',
          // '1000000000',
          // '1000000000',
          // '1000000000',
          ZERO_BN,
        ]
      : [];

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
          selectedPosition.investmentLong.big,
          selectedPosition.investmentBorrowed.big,
          ZERO_BN,
        ]
      : [];

    return output;
  }
};
