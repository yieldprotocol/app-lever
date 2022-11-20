import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract, ethers } from 'ethers';

export type Provider = Web3Provider | ethers.providers.JsonRpcProvider;

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

interface W3bNumber {
  dsp: number;
  hStr: string;
  big: BigNumber;
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

// export enum AppState {
//   Loading,
//   ApprovalRequired,
//   Transactable,
//   DebtTooLow,
//   NotEnoughFunds,
//   UnknownError,
//   Undercollateralized,
//   Approving,
//   Transacting,
// }

// export enum TxState {
//   ApprovalRequired,
//   ApprovalPending,
//   TxReady,
//   TxPending,
//   TxComplete,
// }

// export interface ISignable {
//   name: string;
//   version: string;
//   address: string;
//   symbol: string;
//   tokenType: TokenType;
// }
