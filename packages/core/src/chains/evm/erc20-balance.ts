import { formatUnits, type Address } from "viem";
import type { NetworkMode } from "../types.js";
import { withAbort } from "../../lib/abort.js";
import { createEvmPublicClient } from "./client.js";

const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export async function getErc20Balance(
  ownerAddress: string,
  tokenAddress: string,
  mode: NetworkMode,
  decimals?: number,
  signal?: AbortSignal,
): Promise<string> {
  const client = createEvmPublicClient(mode);
  const balance = await withAbort(
    client.readContract({
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [ownerAddress as Address],
    }),
    signal,
  );

  const tokenDecimals =
    decimals ??
    (await withAbort(
      client.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: "decimals",
      }),
      signal,
    ));

  return formatUnits(balance, tokenDecimals);
}
