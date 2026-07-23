import { type Hex } from "viem";
import type { NetworkMode } from "../types.js";
import { createEvmPublicClient } from "./client.js";

export async function broadcastEvmTransaction(
  signedTx: Hex,
  mode: NetworkMode,
): Promise<Hex> {
  const client = createEvmPublicClient(mode);

  return client.sendRawTransaction({ serializedTransaction: signedTx });
}
