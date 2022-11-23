import { Simulator } from '../hooks/useLever';
import { TokenType } from '../lib/types';
import { USDC, WETH, WSTETH, YSUSDC6MJD,  } from './assets';

import { stEthSimulator }  from '../leverSimulators/stEthSim';
import { STETH_LEVER, YIELD_STRATEGY_LEVER } from './contracts';
import { yieldStrategySimulator } from '../leverSimulators/yieldStrategySim';

interface ILeverCommon {
  leverAddress: string;
  tradePlatform: string;
  leverSimulator: Simulator;
}

export interface ILeverRoot extends ILeverCommon{
  id: string;
  displayName: string;
  maturity: number;
  investTokenType: TokenType;
  investTokenAddress: string;
  
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

const strategyLeverCommon_: ILeverCommon = {
  leverAddress : YIELD_STRATEGY_LEVER,
  leverSimulator: yieldStrategySimulator,
  tradePlatform: TradePlatforms.YIELD,
}

// const notionalLeverBase_: ILeverCommon = {
//   leverAddress : NOTIONAL_LEVER,
//   leverSimulator: stEthSimulator,
//   tradePlatform: TradePlatforms.NOTIONAL,
// }

export const LEVERS = new Map<string, ILeverRoot>();

LEVERS.set('STETH_01', {
  ...stEthLeverCommon_,
  id: 'STETH_01',
  displayName: 'STETH <> ETH',
  maturity: 1672412400,
  investTokenType: TokenType.FYTOKEN,
  investTokenAddress: '0x386a0a72ffeeb773381267d69b61acd1572e074d',
  seriesId: '0x303030380000',
  ilkId: WSTETH,
  baseId: WETH,
});

LEVERS.set('STETH_02', {
  ...stEthLeverCommon_,
  id: 'STETH_02',
  displayName: 'STETH <> ETH',
  maturity: 1680274800,
  investTokenType: TokenType.FYTOKEN,
  investTokenAddress: '0x0FBd5ca8eE61ec921B3F61B707f1D7D64456d2d1',
  seriesId: '0x303030390000',
  ilkId: WSTETH,
  baseId: WETH,
});

LEVERS.set('STRATEGY_01', {
  ...strategyLeverCommon_,
  id: 'STRAT_001',
  displayName: 'YS-USDC',
  maturity: 1672412400,
  investTokenType: TokenType.FYTOKEN,
  investTokenAddress: '0x38b8bf13c94082001f784a642165517f8760988f',
  seriesId: '0x303230380000',
  ilkId: YSUSDC6MJD,
  baseId: USDC,
});

// LEVERS.set('STRATEGY_02', {
//   ...strategyLeverCommon_,
//   id: '002',
//   displayName: 'YIELD_STRATEGY DEC_2022',
//   maturity: 1680274800,
//   investTokenType: TokenType.FYTOKEN,
//   investTokenAddress: '0x0FBd5ca8eE61ec921B3F61B707f1D7D64456d2d1',
//   seriesId: '0x303030390000',
//   ilkId: WSTETH,
//   baseId: USDC,
// });

// LEVERS.set('STRATEGY_01', {
//   ...stEthLeverBase_,
//   id: '001',
//   displayName: 'WETH_STETH MAR_2023',
//   maturity: 1680274800,
//   investTokenType: TokenType.FYTOKEN,
//   investTokenAddress: '0x0FBd5ca8eE61ec921B3F61B707f1D7D64456d2d1',
//   seriesId: '0x303030390000',
// });

// LEVERS.set('StETH_02', {
//   id: '002',
//   displayName: 'WETH <> STETH MAR 2023',
//   maturity: 1680274800,

//   investTokenType: TokenType.FYTOKEN,
//   investTokenAddress: '0x0FBd5ca8eE61ec921B3F61B707f1D7D64456d2d1',

//   leverAddress: STETH_LEVER,
//   swapAddress: '0x828b154032950C8ff7CF8085D841723Db2696056',

//   ilkId: WSTETH,
//   baseId: WETH,
//   seriesId: '0x303030390000',
// });
