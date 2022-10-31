import { Provider } from '@ethersproject/providers';
import {
  Cauldron,
  FYToken,
  Ladle,
  Pool,
  ERC20Permit,
  ERC20,
  Pool__factory,
  FYToken__factory,
  ERC20__factory,
  Ladle__factory,
  Cauldron__factory,
  ERC1155__factory,
  ERC20Permit__factory,
} from '@yield-protocol/ui-contracts';
import { Signer } from 'ethers';
import {
  FlashJoin,
  FlashJoin__factory,
  IOracle,
  IOracle__factory,
  StableSwap__factory,
  StEthLever__factory,
  WStEth,
  WStEth__factory,
} from '../contracts/types';
import { StableSwap } from '../contracts/types/StableSwap';
import { StEthLever } from '../contracts/types/StEthLever';
import { TokenType } from '../lib/types';

/**
 * Specific Contract addresses
 */

/* Protocol contracts */
export const CAULDRON = '0xc88191F8cb8e6D4a668B047c1C8503432c3Ca867';
export const LADLE = '0x6cB18fF2A33e981D1e38A663Ca056c0a5265066A';

/* Asset Contracts */
export const WSTETH = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
export const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
/* joins */
export const WETH_JOIN = '0x3bDb887Dc46ec0E964Df89fFE2980db0121f0fD0';
/* levers */
export const STETH_LEVER = '0xe888e0403e3e992fdbb473650547428e90f9ddfc';
/* swaps contracts */
export const WETH_STETH_STABLESWAP = '0x828b154032950c8ff7cf8085d841723db2696056';

/* general contract type */

// const ERC720 = TokenType.ERC720;
export const FYTOKEN = TokenType.FYTOKEN;
export const YIELD_POOL = TokenType.YIELD_POOL;
export const ORACLE = TokenType.ORACLE;

type DefContracts = {
  [CAULDRON]: Cauldron;
  [WETH]: ERC20;
  [STETH_LEVER]: StEthLever;
  [LADLE]: Ladle;
  [WETH_STETH_STABLESWAP]: StableSwap;
  [WSTETH]: WStEth;
  [WETH_JOIN]: FlashJoin;

  // [TokenType.FYTOKEN]: FYToken;
  // [TokenType.YIELD_POOL]: Pool;
  // [TokenType.ORACLE]: IOracle;
  // [TokenType.ERC1155]: FYToken;
  // [TokenType.ERC20_DAI_PERMIT]: ERC20Permit;
  // [TokenType.ERC20_PERMIT]: ERC20Permit;
  // [TokenType.ERC20]: ERC20;
};

export type Contracts = {
  [key in keyof DefContracts]?: DefContracts[key];
};

type ContractFactories = Readonly<{
  [address in keyof DefContracts]: {
    connect(address: string, signerOrProvider: Signer | Provider): DefContracts[address];
  };
}>;

/* assign contract factories to addresses */
export const contractFactories: ContractFactories = {
  [CAULDRON]: Cauldron__factory,
  [WETH]: ERC20__factory,
  [STETH_LEVER]: StEthLever__factory,
  [LADLE]: Ladle__factory,
  [WETH_STETH_STABLESWAP]: StableSwap__factory,
  [WSTETH]: WStEth__factory,
  [WETH_JOIN]: FlashJoin__factory,

  // [TokenType.FYTOKEN]: FYToken__factory,
  // [TokenType.YIELD_POOL]: Pool__factory,
  // [TokenType.ORACLE]: IOracle__factory,
  // [TokenType.ERC1155]: ERC1155__factory,
  // [TokenType.ERC20_DAI_PERMIT]: ERC20Permit__factory,
  // [TokenType.ERC20_PERMIT]: ERC20Permit__factory,
  // [TokenType.ERC20]: ERC20__factory,
};

// export const contractFactoryMap = new Map([
//   [CAULDRON, Cauldron__factory],
//   [WETH, ERC20__factory],
//   [STETH_LEVER, StEthLever__factory],
//   // [LADLE, Ladle__factory],
//   // [WETH_STETH_STABLESWAP, StableSwap__factory],
//   // [WSTETH, WStEth__factory],
//   // [WETH_JOIN, FlashJoin__factory]
// ]);

export const contractFactoryMap = new Map([
  [TokenType.FYTOKEN, FYToken__factory],
  [TokenType.YIELD_POOL, Pool__factory],
  [TokenType.ORACLE, IOracle__factory],
  [TokenType.ERC1155, ERC1155__factory],
  [TokenType.ERC20_DAI_PERMIT, ERC20Permit__factory],
  [TokenType.ERC20_PERMIT, ERC20Permit__factory],
  [TokenType.ERC20, ERC20__factory],
]);

// console.log(contractFactories[WETH])

// const contracts: MutableRefObject<Contracts> = useRef({});

/** Get a (typed) contract instance. */
// export const getContract = <T extends keyof DefinitelyContracts>(
//   address: T,
//   signer: Signer | Provider
// ): DefinitelyContracts[T] => {
//   if (contracts.current[address] === undefined)
//     contracts.current[address] = contractFactories[address].connect(address, signer);
//   return contracts.current[address] as DefinitelyContracts[T];
// };

// export const getFyTokenAddress = async (
//   seriesId: string,
//   signer: Signer
// ): Promise<string> => {
//   const pool = await getPool(seriesId, signer);
//   return await pool.fyToken();
// };

// export const getFyToken = async (
//   seriesId: string,
//   signer: Signer
// ): Promise<FYToken> => {
//   const fyTokenAddress = await getFyTokenAddress(seriesId, signer);
//   return FYToken__factory.connect(fyTokenAddress, signer);
// };

// export const getPool = async (
//   seriesId: string,
//   signer: Signer|Provider
// ): Promise<IPool> => {
//   const ladle = getContract(LADLE, signer);
//   const pool = await ladle.pools(seriesId);
//   return IPool__factory.connect(pool, signer);
// };
