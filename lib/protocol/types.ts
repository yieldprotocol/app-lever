import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract, ethers } from 'ethers';
import { ERC20Permit, FYToken, Pool } from '../../contracts/types';
import { ISignable } from '../tx/types';

export type Provider = Web3Provider | ethers.providers.JsonRpcProvider;

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
