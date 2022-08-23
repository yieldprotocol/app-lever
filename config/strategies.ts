import { NOTIONAL_LEVER, NOTIONAL_SWAP } from '../contracts';
import { TokenType } from '../lib/types';
import { WETH, WSTETH } from './assets';
import { STETH_LEVER, WETH_STETH_STABLESWAP } from './contractRegister';



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
  displayName: 'STETH SEP',
  maturity: 1664550000,

  investTokenType: TokenType.FYTOKEN,
  investTokenAddress: '0x53358d088d835399f1e97d2a01d79fc925c7d999',

  leverAddress: STETH_LEVER, // 0x2ed8e1c1439576aede07e585de0fd2e9bedacf2f
  swapAddress: '0x828b154032950C8ff7CF8085D841723Db2696056',

  ilkId: WSTETH,
  baseId: WETH,
  seriesId: '0x303030370000',
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
