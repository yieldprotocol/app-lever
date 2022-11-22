import { sellBase, sellFYToken, ZERO_BN } from '@yield-protocol/ui-math';
import { IInputContextState } from '../context/InputContext';
import { ILeverContextState } from '../context/LeverContext';
import { ZERO_W3N } from '../constants';
import { NULL_OUTPUT, Simulator, SimulatorOutput } from '../hooks/useLever';
import { IMarketContextState } from '../context/MarketContext';
import { IPositionContextState } from '../context/PositionContext';
import { Operation, Provider, W3bNumber } from '../lib/types';
import { convertToW3bNumber } from '../lib/utils';

// import { YieldStrategyLever__factory} from '../contracts/types';

/* Swap contract */
// export const WETH_STETH_STABLESWAP = '0x828b154032950c8ff7cf8085d841723db2696056';

export const STRATEGY_ORACLE = '0x3EA4618cE652eaB330F00935FD075F5Cb614e689';

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

export const yieldStrategySimulator: Simulator = async (
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
    ? convertToW3bNumber(inputAsFyToken_, shortAsset?.decimals, shortAsset?.digitFormat)
    : ZERO_W3N;

  const totalToInvest_ = inputAsFyToken.big.mul(leverage!.big).div(100);
  const totalToInvest: W3bNumber = inputAsFyToken.big.gt(ZERO_BN)
    ? convertToW3bNumber(totalToInvest_, shortAsset?.decimals, shortAsset?.digitFormat)
    : ZERO_W3N;

  const toBorrow_ = totalToInvest.big.sub(inputAsFyToken.big);
  const toBorrow: W3bNumber = inputAsFyToken
    ? convertToW3bNumber(toBorrow_, shortAsset?.decimals, shortAsset?.digitFormat)
    : ZERO_W3N;

  if (input.big.gt(ZERO_BN) && provider) {
    console.log('Fired STRATEGY LEVER....');
    const netInvestAmount = inputAsFyToken.big.add(toBorrow.big); // .sub(fee); // - netInvestAmount = baseAmount + borrowAmount - fee
    const baseObtained = sellFYToken(
      marketState.sharesReserves,
      marketState.fyTokenReserves,
      netInvestAmount,
      timeToMaturity.toString(),
      marketState.ts,
      marketState.g1,
      marketState.decimals
    );

    output.investmentBorrowed = toBorrow;
    output.shortInvested = convertToW3bNumber(baseObtained, shortAsset?.decimals, shortAsset?.digitFormat);
    output.investmentFee = convertToW3bNumber(
      output.shortInvested.big.mul(4).div(10000),
      shortAsset?.decimals,
      shortAsset?.digitFormat
    );
  }

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
        output.investmentBorrowed.big, // extra borrow required
        output.shortInvested.big, // fyToken required to buy for the borrow
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
        selectedPosition.investmentDebt.big,
        ZERO_BN,
      ]
    : [];

  return output;
};
