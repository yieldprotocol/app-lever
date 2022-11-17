import { IInputContextState } from '../context/InputContext';
import { ILeverContextState } from '../context/LeverContext';
import { simOutput } from '../hooks/useLever';
import { TokenType } from '../lib/types';
import { WETH, WSTETH } from './assets';

import { stEthSimulator }  from '../leverSimulators/stEthSim';
import { ethers } from 'ethers';

export interface ILeverRoot {
  id: string;
  displayName: string;
  maturity: number;
  investTokenType: TokenType;
  investTokenAddress: string;
  leverAddress: string;
  ilkId: string;
  baseId: string;
  seriesId: string;
  tradePlatform: string;
  leverSimulator: (
    inputContext: IInputContextState,
    leverContext: ILeverContextState,
    marketContext: any,
    provider?: ethers.providers.BaseProvider | undefined,
    currentTime?: number,
  ) => Promise<simOutput>;
}

export enum TradePlatforms {
  CURVE = 'CURVE',
  YIELD = 'YIELD',
  NOTIONAL= 'NOTIONAL'
}

export enum LeverContractAddresses {
  STETH_LEVER = '0x60a6a7fabe11ff36cbe917a17666848f0ff3a60a',
  STRATEGY_LEVER = '0x60a6a7fabe11ff36cbe917a17666848f0ff3a60a',
  NOTIONAL_LEVER = '0x60a6a7fabe11ff36cbe917a17666848f0ff3a60a'
}

export const LEVERS = new Map<string, ILeverRoot>();

LEVERS.set('STETH_01', {
  id: '001',
  displayName: 'WETH_STETH DEC_2022',
  maturity: 1672412400,

  investTokenType: TokenType.FYTOKEN,
  investTokenAddress: '0x386a0a72ffeeb773381267d69b61acd1572e074d',

  leverAddress: LeverContractAddresses.STETH_LEVER,

  ilkId: WSTETH,
  baseId: WETH,
  seriesId: '0x303030380000',

  leverSimulator: stEthSimulator,
  tradePlatform: TradePlatforms.CURVE,
});

LEVERS.set('STETH_02', {
  id: '002',
  displayName: 'WETH_STETH MAR_2023',
  maturity: 1680274800,
  investTokenType: TokenType.FYTOKEN,
  investTokenAddress: '0x0FBd5ca8eE61ec921B3F61B707f1D7D64456d2d1',

  leverAddress: LeverContractAddresses.STETH_LEVER,

  ilkId: WSTETH,
  baseId: WETH,
  seriesId: '0x303030390000',

  leverSimulator: stEthSimulator,
  tradePlatform: TradePlatforms.CURVE,
});

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
