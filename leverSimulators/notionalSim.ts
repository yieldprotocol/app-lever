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

import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import { _simCommon } from './_simCommon';

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/notional-finance/mainnet-v2',
  cache: new InMemoryCache(),
});

enum NotionalSymbols {
  USDC = 'USDC',
  WBTC = 'WBTC',
  DAI = 'DAI',
  WETH = 'WETH',
  ETH = 'ETH',
}

/**
 * NOTIONAL interaction:
 * get apy and fee
 * */
const getNotionalInfo = async (symbol: NotionalSymbols, maturity: number): Promise<[string, BigNumber, number]> => {
  /* use ETH instead of WETH */
  const symbol_ = symbol !== NotionalSymbols.WETH ? symbol : NotionalSymbols.ETH;

  // get a maturity window to check for a corresponding notional market
  const maturityMin = maturity - 15 * 86400; // +- x  days before
  const maturityMax = maturity + 15 * 86400; // +-  x days after

  const response = await client.query({
    query: gql`
    query getMarkets($symbol: String = ${symbol_}, $minMaturity: Int = ${maturityMin}, $maxMaturity: Int = ${maturityMax}) {
      markets(
        first: 5,
        where: {
          and: [
            {marketIndex: 2,
              currency_: {underlyingSymbol: $symbol} },
             {maturity_gt: $minMaturity},
             {maturity_lt: $maxMaturity}
          ]
        }
      ) {
        currency {
          underlyingSymbol
        }
        maturity
        marketIndex
        id
        oracleRate
        lastImpliedRate
      }
    }
    `,
  });

  const investApy = ((response.data.markets[0].oracleRate * 100) / 1e9).toString();
  const investFee = ZERO_BN;
  const notionalMaturity = response.data.markets[0].maturity;

  return [investApy, investFee, notionalMaturity];
};

const getNotionalAssetCode = (symbol: NotionalSymbols): number => {
  if (symbol === NotionalSymbols.ETH) return 1;
  if (symbol === NotionalSymbols.WETH) return 1;
  if (symbol === NotionalSymbols.DAI) return 2;
  if (symbol === NotionalSymbols.USDC) return 3;
  if (symbol === NotionalSymbols.WBTC) return 4;
  return 0;
};

export const notionalSimulator: Simulator = async (
  inputState: IInputContextState,
  leverState: ILeverContextState,
  marketState: IMarketContextState,
  positionState: IPositionContextState,
  provider: Provider,
  existingPositionView: boolean = false,
  currentTime: number = Math.round(new Date().getTime() / 1000)
): Promise<SimulatorOutput | undefined> => {
  /* Notional Contract for getting trade info */
  const NOTIONAL_CONTRACT = '0x1344A36A1B56144C3Bc62E7757377D288fDE0369';
  const notionalContract = new ethers.Contract(NOTIONAL_CONTRACT, NOTIONAL_ABI, provider);

  /* common sim */
  const {
    input,
    leverage,
    selectedLever,
    selectedPosition,
    yearProportion,
    timeToMaturity,

    shortAsset,
    longAsset,

    shortAssetInput,
    debtAtMaturity,
    shortAssetBorrowed,
    shortAssetObtained,
    flashBorrowFee,

    _blankSimOutput,
  } = await _simCommon(inputState, leverState, marketState, positionState, currentTime);
  // } = await _simCommon(inputState, leverState, marketState, positionState, provider, existingPositionSim, currentTime);

  /* starts with blank output */
  const output = _blankSimOutput;

  /**
   * NEW POSITION SIMULATION
   * */
  if (!existingPositionView && input?.big.gt(ZERO_BN)) {
    /* try the simulation, catch any unknown errors */
    console.log('Running NOTIONAL Lever simulator...');

    /**
     *
     * BORROWING SECTION
     * (mostly from _simCommonFragment)
     *
     */
    output.shortAssetBorrowed = shortAssetBorrowed;
    output.shortAssetInput = shortAssetInput;
    output.flashBorrowFee = flashBorrowFee;
    output.shortAssetObtained = shortAssetObtained;
    output.debtAtMaturity = debtAtMaturity;

    /**
     *
     * INVESTMENT SECTION
     *
     * */

    /* Get the apy/fee for a specific notional market */
    const [investApy, investFee, notionalMaturity] = await getNotionalInfo(
      shortAsset?.symbol as NotionalSymbols,
      marketState.maturity
    );

    /**
     * output.tradingFee
     * */
    output.tradingFee = convertToW3bNumber(investFee, shortAsset?.decimals, shortAsset?.displayDigits);

    /**
     * output.longAssetObtained
     **/
    const block = await provider.getBlock('latest');
    const [longAssetObtained_] = await notionalContract.getfCashLendFromDeposit(
      getNotionalAssetCode(shortAsset?.symbol as NotionalSymbols),
      shortAssetObtained.big, // total to *base* invest
      notionalMaturity,
      0,
      block.timestamp,
      true
    );
    output.longAssetObtained = convertToW3bNumber(longAssetObtained_, longAsset!.decimals, longAsset!.displayDigits);

    /**
     * output.investmentAtMaturity
     * */
    const rewards = parseFloat(investApy || '0') * yearProportion;
    const returns = (output.longAssetObtained.dsp * (1 + rewards / 100)).toFixed(longAsset!.decimals);
    const estimatedReturns = ethers.utils.parseUnits(returns, longAsset!.decimals);
    const returnsLessFees = estimatedReturns.sub(output.tradingFee.big);
    output.investmentAtMaturity = convertToW3bNumber(returnsLessFees, longAsset!.decimals, longAsset!.displayDigits);

    /**
     * The investment value of the notional asset at maturity is the same as the  cToken 1:1
     * */
    output.investmentValue = output.investmentAtMaturity;

    /** INVEST : 
        bytes6 seriesId,
        bytes6 strategyId,
        uint256 amountToInvest,
        uint256 borrowAmount,
    */
    output.investArgs = selectedLever
      ? [
          selectedLever.seriesId,
          selectedLever.ilkId,
          input.big, // amount user added (eg USDC)
          output.shortAssetBorrowed.big, // extra borrow required
        ]
      : [];
      
    console.log('INVEST OUTPUT', output);
    return output;
  }

  /**
   *  EXISTIING NOTIONAL POSITION SIMULATION
   */
  if (existingPositionView && selectedPosition) {
    /* try the simulation, catch any unknown errors */
    console.log('Running STRATEGY Lever EXISTING POSITION simulator...');

    /* Get the current Notional info */
    const [investApy, investFee, notionalMaturity] = await getNotionalInfo(
      shortAsset?.symbol as NotionalSymbols,
      marketState.maturity
    );

    /* Get any trading fees to close position */
    output.tradingFee = convertToW3bNumber(investFee, longAsset?.decimals, longAsset?.displayDigits);

    /* Get the info about selected position from the _simCommon */
    output.shortAssetInput = selectedPosition.shortAssetObtained;
    output.shortAssetInput = selectedPosition.shortAssetInput;
    output.longAssetObtained = selectedPosition.longAssetObtained;
    output.shortAssetObtained = selectedPosition.shortAssetObtained;
    output.debtAtMaturity = selectedPosition.debtAtMaturity;
    output.shortAssetBorrowed = selectedPosition.shortAssetBorrowed;

    /* Add extra rewards to be incurred until end of period */
    // const rewards = parseFloat(investApy || '0') * yearProportion;
    // const returns = ethers.utils.parseEther((selectedPosition.longAssetObtained.dsp * (1 + rewards / 100)).toString());
    const returns = selectedPosition.longAssetObtained.big // ethers.utils.parseEther((selectedPosition.longAssetObtained.dsp * (1 + rewards / 100)).toString());
    const returnsLessFees = returns.sub(investFee);

    // const stEthPlusReturns = boughtStEth.mul(returns)
    output.investmentAtMaturity = convertToW3bNumber(returnsLessFees, longAsset?.decimals, longAsset?.displayDigits);

    /**
     * Calculate how much will be returned if divesting now
     **/
    const block = await provider.getBlock('latest');
    const [shortAssetFromLend] = await notionalContract.getDepositFromfCashLend(
      getNotionalAssetCode(shortAsset?.symbol as NotionalSymbols),
      selectedPosition.longAssetObtained.big, // total to *base* invest
      notionalMaturity,
      0,
      block.timestamp
    ); // .catch(()=>{console.log('failed'); return ZERO_BN} );

    const investValue_ = await shortAssetFromLend;
    const investValueLessFees = investValue_.sub(investFee);
    output.investmentValue = convertToW3bNumber(investValueLessFees, shortAsset?.decimals, shortAsset?.displayDigits);

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

export const NOTIONAL_ABI = [
  {
    inputs: [
      { internalType: 'uint16', name: 'currencyId', type: 'uint16' },
      { internalType: 'uint88', name: 'amountToDepositExternalPrecision', type: 'uint88' },
    ],
    name: 'calculateNTokensToMint',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: 'currencyId', type: 'uint16' },
      { internalType: 'int256', name: 'cashBalanceInternal', type: 'int256' },
      { internalType: 'bool', name: 'convertToUnderlying', type: 'bool' },
    ],
    name: 'convertCashBalanceToExternal',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: 'currencyId', type: 'uint16' },
      { internalType: 'int88', name: 'fCashAmount', type: 'int88' },
      { internalType: 'uint256', name: 'marketIndex', type: 'uint256' },
      { internalType: 'uint256', name: 'blockTime', type: 'uint256' },
    ],
    name: 'getCashAmountGivenfCashAmount',
    outputs: [
      { internalType: 'int256', name: '', type: 'int256' },
      { internalType: 'int256', name: '', type: 'int256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: 'currencyId', type: 'uint16' },
      { internalType: 'uint256', name: 'fCashAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'maturity', type: 'uint256' },
      { internalType: 'uint32', name: 'minLendRate', type: 'uint32' },
      { internalType: 'uint256', name: 'blockTime', type: 'uint256' },
    ],
    name: 'getDepositFromfCashLend',
    outputs: [
      { internalType: 'uint256', name: 'depositAmountUnderlying', type: 'uint256' },
      { internalType: 'uint256', name: 'depositAmountAsset', type: 'uint256' },
      { internalType: 'uint8', name: 'marketIndex', type: 'uint8' },
      { internalType: 'bytes32', name: 'encodedTrade', type: 'bytes32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getLibInfo',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'maturity', type: 'uint256' },
      { internalType: 'uint256', name: 'blockTime', type: 'uint256' },
    ],
    name: 'getMarketIndex',
    outputs: [{ internalType: 'uint8', name: 'marketIndex', type: 'uint8' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: 'currencyId', type: 'uint16' },
      { internalType: 'uint256', name: 'maturity', type: 'uint256' },
      { internalType: 'int256', name: 'notional', type: 'int256' },
      { internalType: 'uint256', name: 'blockTime', type: 'uint256' },
      { internalType: 'bool', name: 'riskAdjusted', type: 'bool' },
    ],
    name: 'getPresentfCashValue',
    outputs: [{ internalType: 'int256', name: 'presentValue', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: 'currencyId', type: 'uint16' },
      { internalType: 'uint256', name: 'fCashBorrow', type: 'uint256' },
      { internalType: 'uint256', name: 'maturity', type: 'uint256' },
      { internalType: 'uint32', name: 'maxBorrowRate', type: 'uint32' },
      { internalType: 'uint256', name: 'blockTime', type: 'uint256' },
    ],
    name: 'getPrincipalFromfCashBorrow',
    outputs: [
      { internalType: 'uint256', name: 'borrowAmountUnderlying', type: 'uint256' },
      { internalType: 'uint256', name: 'borrowAmountAsset', type: 'uint256' },
      { internalType: 'uint8', name: 'marketIndex', type: 'uint8' },
      { internalType: 'bytes32', name: 'encodedTrade', type: 'bytes32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: 'currencyId', type: 'uint16' },
      { internalType: 'int88', name: 'netCashToAccount', type: 'int88' },
      { internalType: 'uint256', name: 'marketIndex', type: 'uint256' },
      { internalType: 'uint256', name: 'blockTime', type: 'uint256' },
    ],
    name: 'getfCashAmountGivenCashAmount',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: 'currencyId', type: 'uint16' },
      { internalType: 'uint256', name: 'borrowedAmountExternal', type: 'uint256' },
      { internalType: 'uint256', name: 'maturity', type: 'uint256' },
      { internalType: 'uint32', name: 'maxBorrowRate', type: 'uint32' },
      { internalType: 'uint256', name: 'blockTime', type: 'uint256' },
      { internalType: 'bool', name: 'useUnderlying', type: 'bool' },
    ],
    name: 'getfCashBorrowFromPrincipal',
    outputs: [
      { internalType: 'uint88', name: 'fCashDebt', type: 'uint88' },
      { internalType: 'uint8', name: 'marketIndex', type: 'uint8' },
      { internalType: 'bytes32', name: 'encodedTrade', type: 'bytes32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: 'currencyId', type: 'uint16' },
      { internalType: 'uint256', name: 'depositAmountExternal', type: 'uint256' },
      { internalType: 'uint256', name: 'maturity', type: 'uint256' },
      { internalType: 'uint32', name: 'minLendRate', type: 'uint32' },
      { internalType: 'uint256', name: 'blockTime', type: 'uint256' },
      { internalType: 'bool', name: 'useUnderlying', type: 'bool' },
    ],
    name: 'getfCashLendFromDeposit',
    outputs: [
      { internalType: 'uint88', name: 'fCashAmount', type: 'uint88' },
      { internalType: 'uint8', name: 'marketIndex', type: 'uint8' },
      { internalType: 'bytes32', name: 'encodedTrade', type: 'bytes32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'blockTime', type: 'uint256' },
    ],
    name: 'nTokenGetClaimableIncentives',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pauseGuardian',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pauseRouter',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];
