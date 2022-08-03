import { BigNumber, Contract, ethers } from 'ethers';
import { ISignable } from '../lib/tx/types';

export interface IAsset extends ISignable {
  id: string;
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  joinAddress: string|undefined; // undefined if no join
  // balance?: BigNumber;
  // contract?: Contract;
  // joinContract?: Contract;
  // getAllowance: (account: string, spender: string) => Promise<BigNumber>;
}

/* asset id's */
export const WETH = '0x303000000000';
export const DAI = '0x303100000000';
export const USDC = '0x303200000000';
export const WSTETH = '0x303700000000';

/* categorisation lists required for signing */
export const ETH_BASED_ASSETS = ['WETH', 'ETH', WETH, ethers.utils.formatBytes32String('ETH').slice(0, 14)];
export const DAI_PERMIT_ASSETS = ['DAI', DAI];
export const NON_PERMIT_ASSETS = ['ETH', 'WETH', WETH];

/* ASSET MAP */
export const ASSETS = new Map<string, IAsset>();

ASSETS.set(WETH, {
  id: WETH,
  name: 'wrapped Ether',
  address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  joinAddress: "0x3bDb887Dc46ec0E964Df89fFE2980db0121f0fD0", 
  symbol: 'WETH',
  decimals: 18,
  version: '1',
});

ASSETS.set(WSTETH, {
  id: WSTETH,
  name: 'wrapped Staked ETH',
  address: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  joinAddress: undefined,
  symbol: 'WSTETH',
  decimals: 18,
  version: '1'
});

ASSETS.set(USDC, {
  id: USDC,
  name: 'USD Coin',
  address: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  joinAddress: undefined,
  symbol: 'WETH',
  decimals: 18,
  version: '1'
});
