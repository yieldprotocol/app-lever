import { Signer } from 'ethers';
import { MutableRefObject } from 'react';
import { Cauldron, Cauldron__factory } from '../contracts/Cauldron.sol';
import {
  FYToken,
  YieldStEthLever,
  FYToken__factory,
  YieldStEthLever__factory,
  YieldLadle,
  YieldLadle__factory,
  IPool,
  IPool__factory,
  IStableSwap,
  IStableSwap__factory,
  WstEth,
  WstEth__factory,
  FlashJoin,
  FlashJoin__factory,
  Weth__factory,
  Weth,
} from '../contracts/YieldStEthLever.sol';

/* Protocol contracts */
export const CAULDRON = '0xc88191F8cb8e6D4a668B047c1C8503432c3Ca867';
export const LADLE = '0x6cB18fF2A33e981D1e38A663Ca056c0a5265066A';

/* Asset Contracts */
export const WSTETH = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
export const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

/* joins */
export const WETH_JOIN = '0x3bDb887Dc46ec0E964Df89fFE2980db0121f0fD0';

/* levers */
export const YIELD_STETH_LEVER = '0x58b9b4708aa91bde104ae2354c5e63d94784f2dd';

/* swaps contracts */
export const WETH_STETH_STABLESWAP = '0x828b154032950C8ff7CF8085D841723Db2696056';

type DefinitelyContracts = {
  [CAULDRON]: Cauldron;
  [WETH]: Weth;
  [YIELD_STETH_LEVER]: YieldStEthLever;
  [LADLE]: YieldLadle;
  [WETH_STETH_STABLESWAP]: IStableSwap;
  [WSTETH]: WstEth;
  [WETH_JOIN]: FlashJoin;
};

export type Contracts = {
  [key in keyof DefinitelyContracts]?: DefinitelyContracts[key];
};

type ContractFactories = Readonly<{
  [address in keyof DefinitelyContracts]: {
    connect(address: string, signerOrProvider: Signer): DefinitelyContracts[address];
  };
}>;

/* assign contract factories to addresses */
export const contractFactories: ContractFactories = {
  [CAULDRON]: Cauldron__factory,
  [WETH]: Weth__factory,
  [YIELD_STETH_LEVER]: YieldStEthLever__factory,
  [LADLE]: YieldLadle__factory,
  [WETH_STETH_STABLESWAP]: IStableSwap__factory,
  [WSTETH]: WstEth__factory,
  [WETH_JOIN]: FlashJoin__factory,
};

// console.log(contractFactories[WETH])

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
): Promise<IPool> => {
  const ladle = getContract(LADLE, contracts, signer);
  const pool = await ladle.pools(seriesId);
  return IPool__factory.connect(pool, signer);
};
