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

const emptySimulation: SimulatorOutput = {
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

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/notional-finance/mainnet-v2',
  cache: new InMemoryCache(),
});

enum NotionalSymbols {
  USDC = 'USDC',
  WBTC = 'WBTC',
  DAI = 'DAI',
  ETH = 'ETH',
}

/**
 * NOTIONAL interaction:
 * get apy and fee
 * */
const getNotionalInfo = async (symbol: NotionalSymbols, maturity: number): Promise<[string, BigNumber]> => {
  // get a maturity window to check for a corresponding notional market
  const maturityMin = maturity - 15 * 86400; // +- x  days before
  const maturityMax = maturity + 15 * 86400; // +-  x days after

  console.log(maturityMin, maturityMax);

  const response = await client.query({
    query: gql`
    query getMarkets($symbol: String = ${symbol}, $minMaturity: Int = ${maturityMin}, $maxMaturity: Int = ${maturityMax}) {
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
  console.log('Notional APY', investApy, '%');

  return [investApy, investFee];
};

export const notionalSimulator: Simulator = async (
  inputState: IInputContextState,
  leverState: ILeverContextState,
  marketState: IMarketContextState,
  positionState: IPositionContextState,
  provider: Provider,
  existingPositionSim: boolean = false,
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
  } = await _simCommon(inputState, leverState, marketState, positionState, provider, existingPositionSim, currentTime);

  const output = emptySimulation;

  if (!existingPositionSim && input?.big.gt(ZERO_BN)) {
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
    const [investApy, investFee] = await getNotionalInfo(shortAsset?.symbol as NotionalSymbols, marketState.maturity);

    /**
     * output.tradingFee
     * */
    output.tradingFee = convertToW3bNumber(investFee, shortAsset?.decimals, shortAsset?.displayDigits);

    /**
     * output.longAssetObtained
     **/
    const block = await provider.getBlock('latest');
    const [longAssetObtained_] = await notionalContract.getfCashLendFromDeposit(
      3,
      shortAssetObtained.big, // total to *base* invest
      1679616000,
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

    /* The investment value of the notional asset at maturity is the same as the  cToken 1:1 */
    output.investmentValue = output.investmentAtMaturity;

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

    console.log(output);
    return output;
  }

  /* Handle the simulation for an existing posiiton/vault */
  if (existingPositionSim && selectedPosition) {
    /* try the simulation, catch any unknown errors */
    console.log('Running STRATEGY Lever POSITION simulator...');

    /* get the curve info */
    const [investApy, investFee] = await getNotionalInfo(shortAsset?.symbol as NotionalSymbols, marketState.maturity);

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
    // output.investmentValue = convertToW3bNumber(investValueLessFees, 18, 3);

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
