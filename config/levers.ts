import { Simulator } from '../hooks/useLever';
import { TokenType } from '../lib/types';
import { WETH, WSTETH } from './assets';

import { stEthSimulator }  from '../leverSimulators/stEthSim';
import { NOTIONAL_LEVER, STETH_LEVER, YIELD_STRATEGY_LEVER } from './contracts';

interface ILeverCommon {
  leverAddress: string;
  ilkId: string;
  baseId: string;
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
}

export enum TradePlatforms {
  CURVE = 'CURVE',
  YIELD = 'YIELD',
  NOTIONAL= 'NOTIONAL'
}

const stEthLeverBase_: ILeverCommon = {
  leverAddress : STETH_LEVER,
  leverSimulator: stEthSimulator,
  tradePlatform: TradePlatforms.CURVE,
  ilkId: WSTETH,
  baseId: WETH,
}

const strategyLeverBase_: ILeverCommon = {
  leverAddress : YIELD_STRATEGY_LEVER,
  leverSimulator: stEthSimulator,
  tradePlatform: TradePlatforms.YIELD,
  ilkId: WSTETH,
  baseId: WETH,
}

const notionalLeverBase_: ILeverCommon = {
  leverAddress : NOTIONAL_LEVER,
  leverSimulator: stEthSimulator,
  tradePlatform: TradePlatforms.NOTIONAL,
  ilkId: WSTETH,
  baseId: WETH,
}

export const LEVERS = new Map<string, ILeverRoot>();

LEVERS.set('STETH_01', {
  ...stEthLeverBase_,
  id: '001',
  displayName: 'WETH_STETH DEC_2022',
  maturity: 1672412400,
  investTokenType: TokenType.FYTOKEN,
  investTokenAddress: '0x386a0a72ffeeb773381267d69b61acd1572e074d',
  seriesId: '0x303030380000',
});

LEVERS.set('STETH_02', {
  ...stEthLeverBase_,
  id: '002',
  displayName: 'WETH_STETH MAR_2023',
  maturity: 1680274800,
  investTokenType: TokenType.FYTOKEN,
  investTokenAddress: '0x0FBd5ca8eE61ec921B3F61B707f1D7D64456d2d1',
  seriesId: '0x303030390000',
});

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
