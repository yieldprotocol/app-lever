/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export type VaultStruct = {
  owner: PromiseOrValue<string>;
  seriesId: PromiseOrValue<BytesLike>;
  ilkId: PromiseOrValue<BytesLike>;
};

export type VaultStructOutput = [string, string, string] & {
  owner: string;
  seriesId: string;
  ilkId: string;
};

export interface YieldLadleInterface extends utils.Interface {
  functions: {
    "build(bytes6,bytes6,uint8)": FunctionFragment;
    "close(bytes12,address,int128,int128)": FunctionFragment;
    "give(bytes12,address)": FunctionFragment;
    "joins(bytes6)": FunctionFragment;
    "pools(bytes6)": FunctionFragment;
    "repay(bytes12,address,int128,uint128)": FunctionFragment;
    "repayVault(bytes12,address,int128,uint128)": FunctionFragment;
    "serve(bytes12,address,uint128,uint128,uint128)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "build"
      | "close"
      | "give"
      | "joins"
      | "pools"
      | "repay"
      | "repayVault"
      | "serve"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "build",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "close",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "give",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "joins",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "pools",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "repay",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "repayVault",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "serve",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(functionFragment: "build", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "close", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "give", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "joins", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pools", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "repay", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "repayVault", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "serve", data: BytesLike): Result;

  events: {};
}

export interface YieldLadle extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: YieldLadleInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    build(
      seriesId: PromiseOrValue<BytesLike>,
      ilkId: PromiseOrValue<BytesLike>,
      salt: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    close(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      art: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    give(
      vaultId_: PromiseOrValue<BytesLike>,
      receiver: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    joins(
      ilkId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    pools(
      seriesId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    repay(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      min: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    repayVault(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      max: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    serve(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      base: PromiseOrValue<BigNumberish>,
      max: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  build(
    seriesId: PromiseOrValue<BytesLike>,
    ilkId: PromiseOrValue<BytesLike>,
    salt: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  close(
    vaultId_: PromiseOrValue<BytesLike>,
    to: PromiseOrValue<string>,
    ink: PromiseOrValue<BigNumberish>,
    art: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  give(
    vaultId_: PromiseOrValue<BytesLike>,
    receiver: PromiseOrValue<string>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  joins(
    ilkId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  pools(
    seriesId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  repay(
    vaultId_: PromiseOrValue<BytesLike>,
    to: PromiseOrValue<string>,
    ink: PromiseOrValue<BigNumberish>,
    min: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  repayVault(
    vaultId_: PromiseOrValue<BytesLike>,
    to: PromiseOrValue<string>,
    ink: PromiseOrValue<BigNumberish>,
    max: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  serve(
    vaultId_: PromiseOrValue<BytesLike>,
    to: PromiseOrValue<string>,
    ink: PromiseOrValue<BigNumberish>,
    base: PromiseOrValue<BigNumberish>,
    max: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    build(
      seriesId: PromiseOrValue<BytesLike>,
      ilkId: PromiseOrValue<BytesLike>,
      salt: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string, VaultStructOutput]>;

    close(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      art: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    give(
      vaultId_: PromiseOrValue<BytesLike>,
      receiver: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<VaultStructOutput>;

    joins(
      ilkId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    pools(
      seriesId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    repay(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      min: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    repayVault(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      max: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    serve(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      base: PromiseOrValue<BigNumberish>,
      max: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    build(
      seriesId: PromiseOrValue<BytesLike>,
      ilkId: PromiseOrValue<BytesLike>,
      salt: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    close(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      art: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    give(
      vaultId_: PromiseOrValue<BytesLike>,
      receiver: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    joins(
      ilkId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    pools(
      seriesId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    repay(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      min: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    repayVault(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      max: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    serve(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      base: PromiseOrValue<BigNumberish>,
      max: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    build(
      seriesId: PromiseOrValue<BytesLike>,
      ilkId: PromiseOrValue<BytesLike>,
      salt: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    close(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      art: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    give(
      vaultId_: PromiseOrValue<BytesLike>,
      receiver: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    joins(
      ilkId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    pools(
      seriesId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    repay(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      min: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    repayVault(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      max: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    serve(
      vaultId_: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      ink: PromiseOrValue<BigNumberish>,
      base: PromiseOrValue<BigNumberish>,
      max: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
