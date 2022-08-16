import { GeneralTokenType } from '../lib/protocol/types';
import { WETH, WSTETH } from './assets';
import { STETH_LEVER, WETH_STETH_STABLESWAP } from './contractRegister';



export interface ILeverStrategyRoot {
  id: string;
  displayName: string;
  maturity: number;

  investTokenType: GeneralTokenType;
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
  maturity: 12342134234,

  investTokenType: GeneralTokenType.FYTOKEN,
  investTokenAddress: '0x53358d088d835399f1e97d2a01d79fc925c7d999',

  leverAddress: '0x58b9b4708aa91bde104ae2354c5e63d94784f2dd',
  swapAddress: '0x828b154032950C8ff7CF8085D841723Db2696056',

  ilkId: WSTETH,
  baseId: WETH,
  seriesId: '0x303030370000',
});

STRATEGIES.set('StETH_02', {
  id: '002',
  displayName: 'STETH DEC',
  maturity: 123412341234,

  investTokenType: GeneralTokenType.FYTOKEN,
  investTokenAddress: '0x828b154032950C8ff7CF8085D841723Db2696056',

  leverAddress: STETH_LEVER,
  swapAddress: WETH_STETH_STABLESWAP,

  ilkId: WSTETH,
  baseId: WETH,
  seriesId: '0x303030370000',
});
