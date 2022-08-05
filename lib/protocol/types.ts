import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract, ethers } from 'ethers';
import { ERC20Permit, FYToken, Pool } from '../../contracts/types';
import { ISignable } from '../tx/types';

export type Provider = Web3Provider | ethers.providers.JsonRpcProvider;

/** 
 * General Token types > could have multiple addresses 
 * */
 export enum GeneralTokenType {
  ERC20_PERMIT,
  ERC20,
  FYTOKEN,
  YIELD_POOL,
  ORACLE
}

export enum AppState {
  Loading,
  ApprovalRequired,
  Transactable,
  DebtTooLow,
  NotEnoughFunds,
  UnknownError,
  Undercollateralized,
  Approving,
  Transacting,
}

export interface IAsset extends ISignable {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  balance: BigNumber;
  balance_: string;
  contract: ERC20Permit | FYToken;
  getAllowance: (account: string, spender: string) => Promise<BigNumber>;
}

export interface ILeverStrategy {

  id: string;
  displayName: string;

  investTokenType: GeneralTokenType;
  investTokenAddress: string;
  investTokenContract?: Contract;

  marketContract?: Contract;

  // outToken: [WETH, AssetId.WEth],
  leverAddress: string;
  leverContract?: Contract;

  swapAddress: string;
  swapContract?: Contract;

  ilkId: string;
  baseId: string;
  seriesId: string;
}
