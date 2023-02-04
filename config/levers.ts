import { Simulator } from '../hooks/useLever';
import { TokenType } from '../lib/types';
import { DAI, FUSDC2303, USDC, WETH, WSTETH, YSDAI6MJD, YSETH6MJD, YSUSDC6MJD,  } from './assets';


import { STETH_LEVER, YIELD_STRATEGY_LEVER, NOTIONAL_LEVER } from './contracts';

/* import the simulators */
import { stEthSimulator }  from '../leverSimulators/stEthSim';
import { yieldStrategySimulator } from '../leverSimulators/yieldStrategySim';
import { notionalSimulator } from '../leverSimulators/notionalSim';

interface ILeverCommon {
  leverAddress: string;
  tradePlatform: string;
  leverSimulator: Simulator;
}

export interface ILeverRoot extends ILeverCommon{
  id: string;
  displayName: string;
  maturity: number;
  // fyTokenType: TokenType;
  fyTokenAddress: string;
  
  seriesId: string;
  ilkId: string;
  baseId: string;
}

export enum TradePlatforms {
  CURVE = 'CURVE',
  YIELD = 'YIELD',
  NOTIONAL= 'NOTIONAL'
}

const stEthLeverCommon_: ILeverCommon = {
  leverAddress : STETH_LEVER,
  leverSimulator: stEthSimulator,
  tradePlatform: TradePlatforms.CURVE,
}

const notionalLeverCommon_: ILeverCommon = {
  leverAddress : NOTIONAL_LEVER,
  leverSimulator: notionalSimulator,
  tradePlatform: TradePlatforms.NOTIONAL,
}

const strategyLeverCommon_: ILeverCommon = {
  leverAddress : YIELD_STRATEGY_LEVER,
  leverSimulator: yieldStrategySimulator,
  tradePlatform: TradePlatforms.YIELD,
}

export const LEVERS = new Map<string, ILeverRoot>();

// LEVERS.set('STETH_01', {
//   ...stEthLeverCommon_,
//   id: 'STETH_01',
//   displayName: 'STETH <> ETH',
//   maturity: 1672412400,
//   // investTokenType: TokenType.FYTOKEN,
//   fyTokenAddress: '0x386a0a72ffeeb773381267d69b61acd1572e074d',
//   seriesId: '0x303030380000',
//   ilkId: WSTETH,
//   baseId: WETH,
// });

// LEVERS.set('STETH_02', {
//   ...stEthLeverCommon_,
//   id: 'STETH_02',
//   displayName: 'STETH <> ETH',
//   maturity: 1680274800,
//   fyTokenAddress: '0x0FBd5ca8eE61ec921B3F61B707f1D7D64456d2d1',
//   seriesId: '0x303030390000',
//   ilkId: WSTETH,
//   baseId: WETH,
// });

// LEVERS.set('STETH_03', {
//   ...stEthLeverCommon_,
//   id: 'STETH_03',
//   displayName: 'STETH <> ETH',
//   maturity: 1688137200,
//   fyTokenAddress: '0x124c9F7E97235Fe3E35820f95D10aFfCe4bE9168',
//   seriesId: '0x0030ff00028b',
//   ilkId: WSTETH,
//   baseId: WETH,
// });

LEVERS.set('FUSDC_2303', {
  ...notionalLeverCommon_,
  id: 'FUSDC_2303',
  displayName: 'FUSDC_2303 <> USDC',
  maturity: 1680274800,
  fyTokenAddress: '0x22E1e5337C5BA769e98d732518b2128dE14b553C',
  seriesId: '0x303230390000',
  ilkId: FUSDC2303,
  baseId: USDC,
});

// LEVERS.set('FUSDC_2306', {
//   ...notionalLeverCommon_,
//   id: 'FUSDC_2306',
//   displayName: 'FUSDC_2306 <> USDC',
//   maturity: 1680274800,
//   fyTokenAddress: '0x22E1e5337C5BA769e98d732518b2128dE14b553C',
//   seriesId: '0x303230390000',
//   ilkId: FUSDC2306,
//   baseId: USDC,
// });


// LEVERS.set('STRATEGY_01', {
//   ...strategyLeverCommon_,
//   id: 'STRAT_001',
//   displayName: 'YS-USDC',
//   maturity: 1672412400,
//   fyTokenAddress: '0x38b8bf13c94082001f784a642165517f8760988f',
//   seriesId: '0x303230380000',
//   ilkId: YSUSDC6MJD,
//   baseId: USDC,
// });

// LEVERS.set('STRATEGY_02', {
//   ...strategyLeverCommon_,
//   id: 'STRAT_002',
//   displayName: 'YS-ETH',
//   maturity: 1672412400,
//   fyTokenAddress: '0x386a0a72ffeeb773381267d69b61acd1572e074d',
//   seriesId: '0x303030380000',
//   ilkId: YSETH6MJD,
//   baseId: WETH,
// });

// LEVERS.set('STRATEGY_03', {
//   ...strategyLeverCommon_,
//   id: 'STRAT_003',
//   displayName: 'YS-DAI',
//   maturity: 1672412400,
//   fyTokenAddress: '0xcdfbf28db3b1b7fc8efe08f988d955270a5c4752',
//   seriesId: '0x303130380000',
//   ilkId: YSDAI6MJD,
//   baseId: DAI,
// });

