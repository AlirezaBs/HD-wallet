import { createPublicClient, http, type PublicClient } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { EVM_NETWORKS, type NetworkMode } from "../types.js";

const chains = { mainnet, sepolia } as const;

export function createEvmPublicClient(mode: NetworkMode): PublicClient {
  const chain = mode === "mainnet" ? chains.mainnet : chains.sepolia;
  return createPublicClient({
    chain,
    transport: http(EVM_NETWORKS[mode].rpcUrl),
  });
}
