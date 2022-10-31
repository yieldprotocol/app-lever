import { TokenType } from '../lib/types';
import { WETH, WSTETH } from './assets';
import { STETH_LEVER } from './contractRegister';

export interface ILeverStrategyRoot {
  id: string;
  displayName: string;
  maturity: number;

  investTokenType: TokenType;
  investTokenAddress: string;
  // outToken: [WETH, AssetId.WEth],
  leverAddress: string;
  swapAddress: string; // marketAddress? 

  ilkId: string;
  baseId: string;
  seriesId: string;
}

export const STRATEGIES = new Map<string, ILeverStrategyRoot>();

STRATEGIES.set('StETH_01', {
  id: '001',
  displayName: 'WETH <> STETH DEC 2022',
  maturity: 1672412400,

  investTokenType: TokenType.FYTOKEN,
  investTokenAddress: '0x386a0a72ffeeb773381267d69b61acd1572e074d',

  leverAddress: STETH_LEVER, 
  swapAddress: '0x828b154032950C8ff7CF8085D841723Db2696056',

  ilkId: WSTETH,
  baseId: WETH,
  seriesId: '0x303030380000',
});


STRATEGIES.set('StETH_02', {
  id: '002',
  displayName: 'WETH <> STETH MAR 2023',
  maturity: 1680274800,

  investTokenType: TokenType.FYTOKEN,
  investTokenAddress: '0x0FBd5ca8eE61ec921B3F61B707f1D7D64456d2d1',

  leverAddress: STETH_LEVER,
  swapAddress: '0x828b154032950C8ff7CF8085D841723Db2696056',

  ilkId: WSTETH,
  baseId: WETH,
  seriesId: '0x303030390000',
});

// STRATEGIES.set('NOTIONAL_01', {
//   id: '002',
//   displayName: 'NOTIONAL DEC',
//   maturity: 1672412400,

//   investTokenType: TokenType.FYTOKEN,
//   investTokenAddress: '0x53358d088d835399f1e97d2a01d79fc925c7d999',

//   leverAddress: NOTIONAL_LEVER, // '0x700814d8124430017094b397ebfb207bdb7b99f8'
//   swapAddress: NOTIONAL_SWAP, // 

//   ilkId: WSTETH,
//   baseId: WETH,
//   seriesId: '0x303030370000',
// });
