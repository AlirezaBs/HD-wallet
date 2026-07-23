import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SOLANA_NETWORKS, type NetworkMode } from "../types.js";
import { withAbort } from "../../lib/abort.js";

export async function getSolanaBalance(
  address: string,
  mode: NetworkMode,
  signal?: AbortSignal,
): Promise<string> {
  const connection = new Connection(SOLANA_NETWORKS[mode].rpcUrl, "confirmed");
  const balance = await withAbort(
    connection.getBalance(new PublicKey(address)),
    signal,
  );
  return (balance / LAMPORTS_PER_SOL).toFixed(9);
}

export async function getSolanaRecentBlockhash(
  mode: NetworkMode,
): Promise<string> {
  const connection = new Connection(SOLANA_NETWORKS[mode].rpcUrl, "confirmed");
  const { blockhash } = await connection.getLatestBlockhash();
  return blockhash;
}

export async function estimateSolanaFee(mode: NetworkMode): Promise<number> {
  const connection = new Connection(SOLANA_NETWORKS[mode].rpcUrl, "confirmed");
  const fee = await connection.getRecentPrioritizationFees();
  if (fee.length > 0) {
    return fee[0]!.prioritizationFee;
  }
  return 5000;
}
