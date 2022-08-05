import { GeneralTokenType, ILeverStrategy } from '../lib/protocol/types';
import { WETH, WSTETH } from './assets';
import { STETH_LEVER, WETH_STETH_STABLESWAP } from './contractRegister';

export const STRATEGIES = new Map<string, ILeverStrategy>();

STRATEGIES.set('StETH_01', {
  id: '001',
  displayName: 'STETH SEP',

  investTokenType: GeneralTokenType.FYTOKEN,
  investTokenAddress: '0x828b154032950C8ff7CF8085D841723Db2696056',

  leverAddress: '0x58b9b4708aa91bde104ae2354c5e63d94784f2dd',
  swapAddress: '0x828b154032950C8ff7CF8085D841723Db2696056',

  ilkId: WSTETH,
  baseId: WETH,
  seriesId: '0x303030370000',
});

STRATEGIES.set('StETH_02', {
  id: '002',
  displayName: 'STETH DEC',

  investTokenType: GeneralTokenType.FYTOKEN,
  investTokenAddress: '0x828b154032950C8ff7CF8085D841723Db2696056',

  leverAddress: STETH_LEVER,
  swapAddress: WETH_STETH_STABLESWAP,

  ilkId: WSTETH,
  baseId: WETH,
  seriesId: '0x303030370000',
});
