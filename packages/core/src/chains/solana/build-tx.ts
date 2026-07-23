import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { SOLANA_NETWORKS, type NetworkMode } from "../types.js";
import type { PreparedSolanaTransaction } from "./types.js";

export type SolTransferParams = {
  from: string;
  to: string;
  amount: string;
  mode: NetworkMode;
};

export async function buildSolTransferTx(
  params: SolTransferParams,
): Promise<PreparedSolanaTransaction> {
  const connection = new Connection(
    SOLANA_NETWORKS[params.mode].rpcUrl,
    "confirmed",
  );
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const lamports = Math.round(parseFloat(params.amount) * LAMPORTS_PER_SOL);
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: new PublicKey(params.from),
  }).add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(params.from),
      toPubkey: new PublicKey(params.to),
      lamports,
    }),
  );

  return {
    serializedMessage: transaction.serializeMessage(),
    blockhash,
    lastValidBlockHeight,
  };
}

export function formatSolTxPreview(params: SolTransferParams): {
  from: string;
  to: string;
  amount: string;
  network: string;
} {
  return {
    from: params.from,
    to: params.to,
    amount: params.amount,
    network: SOLANA_NETWORKS[params.mode].name,
  };
}
