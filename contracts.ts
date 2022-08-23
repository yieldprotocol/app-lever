import { Signer } from 'ethers';
import { MutableRefObject } from 'react';
import {
  Cauldron,
  Cauldron__factory,
  ERC20,
  ERC20__factory,
  FlashJoin,
  FlashJoin__factory,
  FYToken,
  FYToken__factory,
  Ladle,
  Ladle__factory,
  NotionalLever,
  NotionalLever__factory,
  Pool,
  Pool__factory,
  StableSwap,
  StableSwap__factory,
  StEthLever,
  StEthLever__factory,
  WStEth,
  WStEth__factory,
} from './contracts/types';

export const CAULDRON = '0xc88191F8cb8e6D4a668B047c1C8503432c3Ca867';
export const LADLE = '0x6cB18fF2A33e981D1e38A663Ca056c0a5265066A';
export const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
export const WST_ETH = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
export const WETH_JOIN = '0x3bDb887Dc46ec0E964Df89fFE2980db0121f0fD0';

export const STETH_LEVER = '0x2ed8e1c1439576aede07e585de0fd2e9bedacf2f'; // "0x58b9b4708aa91bde104ae2354c5e63d94784f2dd" //  "0x0cf17d5dcda9cf25889cec9ae5610b0fb9725f65";
export const WETH_STETH_STABLESWAP = '0x828b154032950C8ff7CF8085D841723Db2696056';

export const NOTIONAL_LEVER = '0x700814d8124430017094b397ebfb207bdb7b99f8';
export const NOTIONAL_SWAP = '';

type DefinitelyContracts = {
  [CAULDRON]: Cauldron;
  [WETH]: ERC20;

  [LADLE]: Ladle;

  [WST_ETH]: WStEth;
  [WETH_JOIN]: FlashJoin;

  [WETH_STETH_STABLESWAP]: StableSwap;
  [STETH_LEVER]: StEthLever;

  [NOTIONAL_LEVER]: NotionalLever;
  // [NOTIONAL_SWAP]: '';
};

export type Contracts = {
  [key in keyof DefinitelyContracts]?: DefinitelyContracts[key];
};

type ContractFactories = Readonly<{
  [address in keyof DefinitelyContracts]: {
    connect(address: string, signerOrProvider: Signer): DefinitelyContracts[address];
  };
}>;

export type ContractAddress = keyof DefinitelyContracts;

const contractFactories: ContractFactories = {
  [CAULDRON]: Cauldron__factory,
  [WETH]: ERC20__factory,
  [STETH_LEVER]: StEthLever__factory,
  [LADLE]: Ladle__factory,
  [WETH_STETH_STABLESWAP]: StableSwap__factory,
  [WST_ETH]: WStEth__factory,
  [WETH_JOIN]: FlashJoin__factory,
  [NOTIONAL_LEVER]: NotionalLever__factory,
};

/** Get a (typed) contract instance. */
export const getContract = <T extends keyof DefinitelyContracts>(
  address: T,
  contracts: MutableRefObject<Contracts>,
  signer: Signer
): DefinitelyContracts[T] => {
  if (contracts.current[address] === undefined)
    contracts.current[address] = contractFactories[address].connect(address, signer);
  return contracts.current[address] as DefinitelyContracts[T];
};

export const getFyTokenAddress = async (
  seriesId: string,
  contracts: MutableRefObject<Contracts>,
  signer: Signer
): Promise<string> => {
  const pool = await getPool(seriesId, contracts, signer);
  return await pool.fyToken();
};

export const getFyToken = async (
  seriesId: string,
  contracts: MutableRefObject<Contracts>,
  signer: Signer
): Promise<FYToken> => {
  const fyTokenAddress = await getFyTokenAddress(seriesId, contracts, signer);
  return FYToken__factory.connect(fyTokenAddress, signer);
};

export const getPool = async (
  seriesId: string,
  contracts: MutableRefObject<Contracts>,
  signer: Signer
): Promise<Pool> => {
  const ladle = getContract(LADLE, contracts, signer);
  const pool = await ladle.pools(seriesId);
  return Pool__factory.connect(pool, signer);
};
