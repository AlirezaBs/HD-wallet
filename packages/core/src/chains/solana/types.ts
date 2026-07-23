export interface PreparedSolanaTransaction {
  serializedMessage: Uint8Array;
  blockhash: string;
  lastValidBlockHeight: number;
}

export interface SignedSolanaTransaction {
  transactionVersion: "legacy";
  encoding: "base64";
  wireTransaction: string;
}

export interface SolanaConfirmationContext {
  blockhash: string;
  lastValidBlockHeight: number;
}
