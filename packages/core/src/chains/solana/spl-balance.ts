import { Connection, PublicKey } from "@solana/web3.js";
import { SOLANA_NETWORKS, type NetworkMode } from "../types.js";
import { withAbort } from "../../lib/abort.js";

export async function getSplTokenBalance(
  ownerAddress: string,
  mintAddress: string,
  mode: NetworkMode,
  signal?: AbortSignal,
): Promise<string> {
  const connection = new Connection(SOLANA_NETWORKS[mode].rpcUrl, "confirmed");
  const owner = new PublicKey(ownerAddress);
  const mint = new PublicKey(mintAddress);

  const accounts = await withAbort(
    connection.getParsedTokenAccountsByOwner(owner, { mint }),
    signal,
  );

  if (accounts.value.length === 0) {
    return "0";
  }

  const amount = accounts.value[0]!.account.data.parsed.info.tokenAmount;
  return amount.uiAmountString ?? "0";
}
