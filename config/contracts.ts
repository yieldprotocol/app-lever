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
  IOracle__factory, StEthLever__factory,
} from '../contracts/types';

import { TokenType } from '../lib/types';
import { LeverContractAddresses } from './levers';

/**
 * Specific Contract addresses
 */

/* Protocol contracts */
export const CAULDRON = '0xc88191F8cb8e6D4a668B047c1C8503432c3Ca867';
export const LADLE = '0x6cB18fF2A33e981D1e38A663Ca056c0a5265066A';

export const contractMap = new Map<string, any>([
  [CAULDRON, Cauldron__factory],
  [LADLE, Ladle__factory],

  /* lever contracts */
  [LeverContractAddresses.STETH_LEVER, StEthLever__factory],
]);

/**
 * Multiple Contracts
 */

export const factoryContractMap = new Map([
  [TokenType.FYTOKEN, FYToken__factory],
  [TokenType.YIELD_POOL, Pool__factory],
  [TokenType.ORACLE, IOracle__factory],
  [TokenType.ERC1155, ERC1155__factory],
  [TokenType.ERC20_DAI_PERMIT, ERC20Permit__factory],
  [TokenType.ERC20_PERMIT, ERC20Permit__factory],
  [TokenType.ERC20, ERC20__factory],
]);
