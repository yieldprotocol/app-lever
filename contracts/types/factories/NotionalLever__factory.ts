/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { NotionalLever, NotionalLeverInterface } from "../NotionalLever";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract Giver",
        name: "giver_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "FlashLoanFailure",
    type: "error",
  },
  {
    inputs: [],
    name: "FLASH_LOAN_RETURN",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes6",
        name: "seriesId",
        type: "bytes6",
      },
    ],
    name: "approveFyToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "joinAddress",
        type: "address",
      },
    ],
    name: "approveJoin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "cauldron",
    outputs: [
      {
        internalType: "contract ICauldron",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes6",
        name: "ilkId",
        type: "bytes6",
      },
      {
        internalType: "bytes6",
        name: "seriesId",
        type: "bytes6",
      },
      {
        internalType: "bytes12",
        name: "vaultId",
        type: "bytes12",
      },
      {
        internalType: "uint128",
        name: "ink",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "art",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "minOut",
        type: "uint256",
      },
    ],
    name: "divest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "giver",
    outputs: [
      {
        internalType: "contract Giver",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes6",
        name: "",
        type: "bytes6",
      },
    ],
    name: "ilkInfo",
    outputs: [
      {
        internalType: "contract FlashJoin",
        name: "join",
        type: "address",
      },
      {
        internalType: "uint40",
        name: "maturity",
        type: "uint40",
      },
      {
        internalType: "uint16",
        name: "currencyId",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes6",
        name: "ilkId",
        type: "bytes6",
      },
      {
        internalType: "bytes6",
        name: "seriesId",
        type: "bytes6",
      },
      {
        internalType: "uint128",
        name: "baseAmount",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "borrowAmount",
        type: "uint128",
      },
    ],
    name: "invest",
    outputs: [
      {
        internalType: "bytes12",
        name: "vaultId",
        type: "bytes12",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "ladle",
    outputs: [
      {
        internalType: "contract ILadle",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC1155BatchReceived",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC1155Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "initiator",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "onFlashLoan",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes6",
        name: "ilkId",
        type: "bytes6",
      },
      {
        components: [
          {
            internalType: "contract FlashJoin",
            name: "join",
            type: "address",
          },
          {
            internalType: "uint40",
            name: "maturity",
            type: "uint40",
          },
          {
            internalType: "uint16",
            name: "currencyId",
            type: "uint16",
          },
        ],
        internalType: "struct YieldNotionalLever.IlkInfo",
        name: "underlying",
        type: "tuple",
      },
    ],
    name: "setIlkInfo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class NotionalLever__factory {
  static readonly abi = _abi;
  static createInterface(): NotionalLeverInterface {
    return new utils.Interface(_abi) as NotionalLeverInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): NotionalLever {
    return new Contract(address, _abi, signerOrProvider) as NotionalLever;
  }
}