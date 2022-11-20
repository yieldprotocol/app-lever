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
export const STETH_LEVER = '0x2093bea6bd953c19c4c6e5d7f6d06354181383a9';
export const YIELD_STRATEGY_LEVER = '0x5582b8398fb586f1b79edd1a6e83f1c5aa558955';
export const NOTIONAL_LEVER = '0x3df40d95931892c68c88bb15ca80f17f7767ecb3';
export const EULER_LEVER = '';

/**
 * Mapped contracts
 */
export const contractMap = new Map<address|TokenType, any>([
  [CAULDRON, Cauldron__factory ],
  [LADLE, Ladle__factory],
  [STETH_LEVER, StEthLever__factory],
  [YIELD_STRATEGY_LEVER, YieldStrategyLever__factory],
  [TokenType.FYTOKEN, FYToken__factory],
  [TokenType.YIELD_POOL, Pool__factory],
  [TokenType.ORACLE, IOracle__factory],
  [TokenType.ERC1155, ERC1155__factory],
  [TokenType.ERC20_DAI_PERMIT, ERC20Permit__factory],
  [TokenType.ERC20_PERMIT, ERC20Permit__factory],
  [TokenType.ERC20, ERC20__factory],
]);
