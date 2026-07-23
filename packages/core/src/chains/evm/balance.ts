import { formatEther, type Address } from "viem";
import type { NetworkMode } from "../types.js";
import { withAbort } from "../../lib/abort.js";
import { createEvmPublicClient } from "./client.js";

export async function getEvmBalance(
  address: string,
  mode: NetworkMode,
  signal?: AbortSignal,
): Promise<string> {
  const client = createEvmPublicClient(mode);
  const balance = await withAbort(
    client.getBalance({ address: address as Address }),
    signal,
  );
  return formatEther(balance);
}

export async function estimateEvmGas(
  from: Address,
  to: Address,
  value: bigint,
  mode: NetworkMode,
): Promise<{ gasLimit: bigint; gasPrice: bigint; fee: string }> {
  const client = createEvmPublicClient(mode);

  const [gasPrice, gasLimit] = await Promise.all([
    client.getGasPrice(),
    client.estimateGas({ account: from, to, value }),
  ]);

  const fee = formatEther(gasLimit * gasPrice);
  return { gasLimit, gasPrice, fee };
}
