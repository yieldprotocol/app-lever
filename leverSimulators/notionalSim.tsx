import { ZERO_BN } from '@yield-protocol/ui-math';
import { IInputContextState } from '../context/InputContext';
import { ILeverContextState } from '../context/LeverContext';
import { ZERO_W3N } from '../constants';
import { Simulator, SimulatorOutput } from '../hooks/useLever';
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

export const notionalSimulator: Simulator = async (
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
  const selectedLever = leverState.selectedLever;
  const selectedPosition = positionState.selectedPosition;

  if (input.big.gt(ZERO_BN) && provider) {
    console.log('Fired NOTIONAL LEVER....');
  }

  /** INVEST : 
        bytes6 seriesId,
        bytes6 ilkId,
        uint256 baseAmount,
        uint256 borrowAmount
  */
  output.investArgs = selectedLever
    ? [
        selectedLever.seriesId,
        selectedLever.ilkId,
        input.big,
        output.shortAssetBorrowed.big,
      ]
    : [];

  /** DIVEST :
        bytes12 vaultId,
        bytes6 seriesId,
        bytes6 ilkId,
        uint256 ink,
        uint256 art,
        uint256 minOut
  */
  output.divestArgs = selectedPosition
    ? [
        selectedPosition.vaultId,
        selectedPosition.seriesId,
        selectedPosition.ilkId,
        selectedPosition.investmentLong.big,
        selectedPosition.investmentBorrowed.big,
        ZERO_BN,
      ]
    : [];

  return output;
};
