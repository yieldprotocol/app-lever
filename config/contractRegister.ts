import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';
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
  IOracle__factory,
  IOracle
} from '../contracts/YieldStEthLever.sol';
import { GeneralTokenType } from '../lib/protocol/types';

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
export const STETH_LEVER = '0x58b9b4708aa91bde104ae2354c5e63d94784f2dd';

/* swaps contracts */
export const WETH_STETH_STABLESWAP = '0x828b154032950C8ff7CF8085D841723Db2696056';


/* general contract type */ 
export const ERC20_PERMIT = GeneralTokenType.ERC20_PERMIT;
export const ERC20 = GeneralTokenType.ERC20_PERMIT;
export const FYTOKEN = GeneralTokenType.FYTOKEN;
export const YIELD_POOL = GeneralTokenType.YIELD_POOL; 

export const ORACLE = GeneralTokenType.ORACLE;

type DefinitelyContracts = {
  [CAULDRON]: Cauldron;
  [WETH]: Weth;
  [STETH_LEVER]: YieldStEthLever;
  [LADLE]: YieldLadle;
  [WETH_STETH_STABLESWAP]: IStableSwap;
  [WSTETH]: WstEth;
  [WETH_JOIN]: FlashJoin;
  [FYTOKEN]: FYToken;
  [YIELD_POOL]: IPool;
  [ORACLE]: IOracle;
};

export type Contracts = {
  [key in keyof DefinitelyContracts]?: DefinitelyContracts[key];
};

type ContractFactories = Readonly<{
  [address in keyof DefinitelyContracts]: {
    connect(address: string, signerOrProvider: Signer|Provider): DefinitelyContracts[address];
  };
}>;

/* assign contract factories to addresses */
export const contractFactories: ContractFactories = {
  [CAULDRON]: Cauldron__factory,
  [WETH]: Weth__factory,
  [STETH_LEVER]: YieldStEthLever__factory,
  [LADLE]: YieldLadle__factory,
  [WETH_STETH_STABLESWAP]: IStableSwap__factory,
  [WSTETH]: WstEth__factory,
  [WETH_JOIN]: FlashJoin__factory,
  [FYTOKEN]: FYToken__factory,
  [YIELD_POOL]: IPool__factory,
  
  [ORACLE]: IOracle__factory,
};

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
