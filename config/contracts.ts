import {
  Pool__factory,
  FYToken__factory,
  ERC20__factory,
  Ladle__factory,
  Cauldron__factory,
  ERC1155__factory,
  ERC20Permit__factory,
} from '@yield-protocol/ui-contracts';
import {
  IOracle__factory, 
  NotionalLever__factory, 
  StEthLever__factory,
  YieldStrategyLever__factory,
} from '../contracts/types';

import { TokenType } from '../lib/types';

type address = string;

/**
 * Specific  Protocol Contract addresses
 */
export const CAULDRON = '0xc88191F8cb8e6D4a668B047c1C8503432c3Ca867';
export const LADLE = '0x6cB18fF2A33e981D1e38A663Ca056c0a5265066A';

/** 
 * Lever contract addresses
 * */
export const STETH_LEVER = '0x40f0b18c7a41c04f848c033ed7f9178d9c5a80d8';
export const NOTIONAL_LEVER = '0x857e28d2f9559c41636986c34843202f890b419b';
export const YIELD_STRATEGY_LEVER = '0x5582b8398fb586f1b79edd1a6e83f1c5aa558955';
// export const EULER_LEVER = '';

/**
 * Mapped contracts
 */
export const contractMap = new Map<address|TokenType, any>([
  /* Yield protocol contracts */
  [CAULDRON, Cauldron__factory ],
  [LADLE, Ladle__factory],

  /* Levers */
  [STETH_LEVER, StEthLever__factory],
  [NOTIONAL_LEVER, NotionalLever__factory],
  [YIELD_STRATEGY_LEVER, YieldStrategyLever__factory],

  /* Generic token types */
  [TokenType.FYTOKEN, FYToken__factory],
  [TokenType.YIELD_POOL, Pool__factory],
  [TokenType.ORACLE, IOracle__factory],
  [TokenType.ERC1155, ERC1155__factory],
  [TokenType.ERC20_DAI_PERMIT, ERC20Permit__factory],
  [TokenType.ERC20_PERMIT, ERC20Permit__factory],
  [TokenType.ERC20, ERC20__factory],

  /* Temp solution to native token*/
  [TokenType.NATIVE, ERC20__factory],
]);
