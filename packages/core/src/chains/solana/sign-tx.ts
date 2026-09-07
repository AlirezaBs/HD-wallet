import {
  Message,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  InvalidSolanaMessageError,
  InvalidSolanaSignatureError,
  SolanaSignerMismatchError,
  SolanaSignerNotRequiredError,
} from "../../crypto/errors.js";
import { bytesToBase64 } from "../../encoding/base64.js";
import type { SignedSolanaTransaction } from "./types.js";

export type ValidateLegacySignerInput = {
  serializedMessage: Uint8Array;
  signerAddress: string;
  expectedSignerAddress: string;
};

export function parseLegacyMessage(serializedMessage: Uint8Array): Message {
  try {
    return Message.from(serializedMessage);
  } catch {
    throw new InvalidSolanaMessageError();
  }
}

export function validateLegacySigner(
  input: ValidateLegacySignerInput,
): Message {
  const message = parseLegacyMessage(input.serializedMessage);

  if (input.signerAddress !== input.expectedSignerAddress) {
    throw new SolanaSignerMismatchError();
  }

  const requiredSigners = message.accountKeys.slice(
    0,
    message.header.numRequiredSignatures,
  );
  const signerKey = new PublicKey(input.signerAddress);
  const isRequiredSigner = requiredSigners.some((key) => key.equals(signerKey));

  if (!isRequiredSigner) {
    throw new SolanaSignerNotRequiredError();
  }

  if (message.header.numRequiredSignatures > 0) {
    const feePayer = message.accountKeys[0];
    if (!feePayer?.equals(signerKey)) {
      throw new SolanaSignerMismatchError(
        "Derived account does not match the transaction fee payer",
      );
    }
  }

  return message;
}

export function assembleSignedLegacySolanaTransaction(
  serializedMessage: Uint8Array,
  signerAddress: string,
  signature: Uint8Array,
): Uint8Array {
  if (signature.length !== 64) {
    throw new InvalidSolanaSignatureError();
  }

  const message = parseLegacyMessage(serializedMessage);
  const transaction = new VersionedTransaction(message);
  const publicKey = new PublicKey(signerAddress);
  transaction.addSignature(publicKey, signature);
  const wireBytes = transaction.serialize();

  if (!Transaction.from(wireBytes).verifySignatures()) {
    throw new Error("Signature verification failed.");
  }

  return wireBytes;
}

export function toSignedSolanaTransaction(
  wireBytes: Uint8Array,
): SignedSolanaTransaction {
  return {
    transactionVersion: "legacy",
    encoding: "base64",
    wireTransaction: bytesToBase64(wireBytes),
  };
}
