import { ZERO_BN } from '@yield-protocol/ui-math';
import { IInputContextState } from '../context/InputContext';
import { ILeverContextState } from '../context/LeverContext';
import { ZERO_W3N } from '../constants';
import { NULL_OUTPUT, Simulator, SimulatorOutput } from '../hooks/useLever';
import { IMarketContextState } from '../context/MarketContext';
import { IPositionContextState } from '../context/PositionContext';
import { Operation, Provider } from '../lib/types';

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
  const selectedLever = leverState.selectedLever;
  const selectedPosition = positionState.selectedPosition;

  if (input.big.gt(ZERO_BN) && provider) {
    console.log('Fired STRATEGY LEVER....');
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
        input.big,
        output.shortBorrowed.big,
        output.shortInvested.big,
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
        selectedPosition.vaultId,
        selectedPosition.seriesId,
        selectedPosition.investment.big,
        selectedPosition.debt.big,
        ZERO_BN,
      ]
    : [];

  return output;
};
