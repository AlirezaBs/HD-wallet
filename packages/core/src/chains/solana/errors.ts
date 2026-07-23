import { SolanaBlockhashExpiredError } from "../../crypto/errors.js";

const BLOCKHASH_EXPIRY_PATTERNS = [
  /blockhash not found/i,
  /block height exceeded/i,
  /transaction expired/i,
  /has expired/i,
  /blockhash expired/i,
];

export function mapSolanaRpcError(error: unknown): Error {
  if (error instanceof Error) {
    const message = error.message;
    if (BLOCKHASH_EXPIRY_PATTERNS.some((pattern) => pattern.test(message))) {
      return new SolanaBlockhashExpiredError();
    }
    return error;
  }
  return new Error(String(error));
}
