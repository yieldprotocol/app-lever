import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, ethers } from 'ethers';

export type Provider = Web3Provider | ethers.providers.JsonRpcProvider | ethers.providers.BaseProvider;

export interface W3bNumber {
  dsp: number;
  hStr: string;
  big: BigNumber;
}

/** 
 * General Token types > could have multiple addresses 
 * */
 export enum TokenType {
  ERC20,
  ERC20_PERMIT,
  ERC20_DAI_PERMIT,
  ERC720,
  ERC1155,
  FYTOKEN,
  YIELD_POOL,
  ORACLE
}

export enum NotificationType {
  INFO,
  WARN,
  ERROR,
}

export interface Notification {
  type: NotificationType;
  msg: string;
}

export enum Operation {
  BORROW,
  REPAY,
  CLOSE,
  REDEEM
}
