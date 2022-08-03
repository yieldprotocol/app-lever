import { WETH, WSTETH } from './assets';

/**
 * The type of token that is invested for this strategy. 
 * If the type is `FyToken`, the address is derived from the selected `seriesId`.
 */
enum InvestTokenType {
  /** Use the debt token corresponding to the series. */
  FyToken,
};

export const STRATEGIES = new Map<string, any>();

STRATEGIES.set('StETH_01', {
  id: '001',
  displayName: 'STETH SEP',
  investTokenType: InvestTokenType.FyToken,
  // outToken: [WETH, AssetId.WEth],
  leverAddress: '0x58b9b4708aa91bde104ae2354c5e63d94784f2dd',
  swapAddress: '0x828b154032950C8ff7CF8085D841723Db2696056',
  ilkId: WSTETH,
  baseId: WETH,
  series: '0x303030370000',
});

STRATEGIES.set('StETH_02', {
  id: '002',
  displayName: 'STETH DEC',
  investToken: InvestTokenType.FyToken,
  // outToken: [WETH, AssetId.WEth],
  leverAddress: '0x58b9b4708aa91bde104ae2354c5e63d94784f2dd',
  swapAddress: '0x828b154032950C8ff7CF8085D841723Db2696056',
  ilkId: WSTETH,
  baseId: WETH,
  series: '0x303030370000',
});
