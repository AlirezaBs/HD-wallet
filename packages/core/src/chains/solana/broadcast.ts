import { Connection } from "@solana/web3.js";
import { SolanaConfirmationFailedError } from "../../crypto/errors.js";
import { SOLANA_NETWORKS, type NetworkMode } from "../types.js";
import { mapSolanaRpcError } from "./errors.js";
import type {
  SignedSolanaTransaction,
  SolanaConfirmationContext,
} from "./types.js";

export async function submitSignedSolanaTransaction(
  signed: SignedSolanaTransaction,
  mode: NetworkMode,
): Promise<string> {
  const connection = new Connection(SOLANA_NETWORKS[mode].rpcUrl, "confirmed");
  try {
    return await connection.sendEncodedTransaction(signed.wireTransaction, {
      skipPreflight: false,
    });
  } catch (error) {
    throw mapSolanaRpcError(error);
  }
}

export async function confirmSolanaTransaction(
  signature: string,
  context: SolanaConfirmationContext,
  mode: NetworkMode,
): Promise<void> {
  const connection = new Connection(SOLANA_NETWORKS[mode].rpcUrl, "confirmed");
  try {
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash: context.blockhash,
        lastValidBlockHeight: context.lastValidBlockHeight,
      },
      "confirmed",
    );

    if (confirmation.value.err) {
      throw new SolanaConfirmationFailedError(
        `Solana transaction confirmation failed: ${JSON.stringify(confirmation.value.err)}`,
      );
    }
  } catch (error) {
    if (error instanceof SolanaConfirmationFailedError) {
      throw error;
    }
    throw mapSolanaRpcError(error);
  }
}
