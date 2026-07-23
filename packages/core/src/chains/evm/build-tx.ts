import {
  encodeFunctionData,
  parseEther,
  parseUnits,
  serializeTransaction,
  type TransactionSerializable,
} from "viem";
import { type Address, type Hex } from "viem";
import { EVM_NETWORKS, type NetworkMode } from "../types.js";
import { createEvmPublicClient } from "./client.js";

const erc20TransferAbi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export type EvmTransferParams = {
  from: Address;
  to: Address;
  amount: string;
  mode: NetworkMode;
};

export type EvmErc20TransferParams = EvmTransferParams & {
  tokenAddress: Address;
  decimals: number;
};

export async function buildEvmTransferTx(
  params: EvmTransferParams,
): Promise<{ unsignedTx: TransactionSerializable; serializedUnsigned: Hex }> {
  const client = createEvmPublicClient(params.mode);

  const [nonce, gasPrice] = await Promise.all([
    client.getTransactionCount({ address: params.from }),
    client.getGasPrice(),
  ]);

  const value = parseEther(params.amount);
  const gas = await client.estimateGas({
    account: params.from,
    to: params.to,
    value,
  });

  const unsignedTx: TransactionSerializable = {
    chainId: EVM_NETWORKS[params.mode].chainId!,
    to: params.to,
    value,
    gas,
    gasPrice,
    nonce,
    type: "legacy",
  };

  const serializedUnsigned = serializeTransaction(unsignedTx);
  return { unsignedTx, serializedUnsigned };
}

export async function buildEvmErc20TransferTx(
  params: EvmErc20TransferParams,
): Promise<{ unsignedTx: TransactionSerializable; serializedUnsigned: Hex }> {
  const client = createEvmPublicClient(params.mode);

  const [nonce, gasPrice] = await Promise.all([
    client.getTransactionCount({ address: params.from }),
    client.getGasPrice(),
  ]);

  const value = parseUnits(params.amount, params.decimals);
  const data = encodeFunctionData({
    abi: erc20TransferAbi,
    functionName: "transfer",
    args: [params.to, value],
  });

  const gas = await client.estimateGas({
    account: params.from,
    to: params.tokenAddress,
    data,
  });

  const unsignedTx: TransactionSerializable = {
    chainId: EVM_NETWORKS[params.mode].chainId!,
    to: params.tokenAddress,
    value: 0n,
    data,
    gas,
    gasPrice,
    nonce,
    type: "legacy",
  };

  const serializedUnsigned = serializeTransaction(unsignedTx);
  return { unsignedTx, serializedUnsigned };
}

export function formatEvmTxPreview(tx: TransactionSerializable): {
  to: string;
  value: string;
  gas: string;
  chainId: number;
} {
  return {
    to: tx.to ?? "",
    value: tx.value ? (Number(tx.value) / 1e18).toString() : "0",
    gas: tx.gas?.toString() ?? "0",
    chainId: tx.chainId ?? 0,
  };
}

export function formatEvmErc20TxPreview(
  params: { to: Address; amount: string; symbol: string },
  tx: TransactionSerializable,
): {
  to: string;
  value: string;
  gas: string;
  chainId: number;
  token: string;
} {
  return {
    to: params.to,
    value: `${params.amount} ${params.symbol}`,
    gas: tx.gas?.toString() ?? "0",
    chainId: tx.chainId ?? 0,
    token: params.symbol,
  };
}
