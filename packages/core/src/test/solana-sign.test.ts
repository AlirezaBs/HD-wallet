import { describe, it, expect, beforeEach, vi } from "vitest";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import * as ed25519 from "@noble/ed25519";
import { ensureEd25519 } from "../crypto/ed25519-setup.js";
import {
  InvalidSolanaMessageError,
  InvalidSolanaSignatureError,
  SolanaSignerMismatchError,
  SolanaSignerNotRequiredError,
  WorkerLockedError,
} from "../crypto/errors.js";
import { cryptoWorkerService } from "../crypto/worker-service.js";
import { clearVault, resetDBConnection } from "../vault/storage.js";
import {
  deriveSolanaAccount,
  getSolanaAddress,
} from "../wallet/derive-solana.js";
import {
  assembleSignedLegacySolanaTransaction,
  validateLegacySigner,
} from "../chains/solana/sign-tx.js";
import { base64ToBytes } from "../encoding/base64.js";

const TEST_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

function buildLegacyTransferMessage(from: string, to: string): Uint8Array {
  const blockhash = "11111111111111111111111111111111";
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: new PublicKey(from),
  }).add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(from),
      toPubkey: new PublicKey(to),
      lamports: 1_000,
    }),
  );
  return transaction.serializeMessage();
}

async function signMessageForAccount(
  mnemonic: string,
  accountIndex: number,
  serializedMessage: Uint8Array,
): Promise<Uint8Array> {
  ensureEd25519();
  const { privateKey } = deriveSolanaAccount(mnemonic, accountIndex);
  try {
    return await ed25519.sign(serializedMessage, privateKey);
  } finally {
    privateKey.fill(0);
  }
}

describe("assembleSignedLegacySolanaTransaction", () => {
  const from = getSolanaAddress(TEST_MNEMONIC, 0);
  const to = getSolanaAddress(TEST_MNEMONIC, 1);

  it("creates a parseable legacy transaction with verified signatures", async () => {
    const serializedMessage = buildLegacyTransferMessage(from, to);
    const signature = await signMessageForAccount(
      TEST_MNEMONIC,
      0,
      serializedMessage,
    );

    const wireBytes = assembleSignedLegacySolanaTransaction(
      serializedMessage,
      from,
      signature,
    );
    const parsed = Transaction.from(wireBytes);

    expect(parsed.verifySignatures()).toBe(true);
    expect(wireBytes.length).toBeGreaterThan(serializedMessage.length);
  });

  it("signs without a global Buffer in browser-like runtimes", async () => {
    const serializedMessage = buildLegacyTransferMessage(from, to);
    const signature = await signMessageForAccount(
      TEST_MNEMONIC,
      0,
      serializedMessage,
    );

    vi.stubGlobal("Buffer", undefined);
    try {
      const wireBytes = assembleSignedLegacySolanaTransaction(
        serializedMessage,
        from,
        signature,
      );
      const parsed = Transaction.from(wireBytes);

      expect(wireBytes).toBeInstanceOf(Uint8Array);
      expect(parsed.verifySignatures()).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("round-trips serialized transaction bytes", async () => {
    const serializedMessage = buildLegacyTransferMessage(from, to);
    const signature = await signMessageForAccount(
      TEST_MNEMONIC,
      0,
      serializedMessage,
    );
    const wireBytes = assembleSignedLegacySolanaTransaction(
      serializedMessage,
      from,
      signature,
    );
    const reparsed = Transaction.from(wireBytes);
    expect(reparsed.serialize().length).toBe(wireBytes.length);
  });

  it("rejects invalid signature size", async () => {
    const serializedMessage = buildLegacyTransferMessage(from, to);
    expect(() =>
      assembleSignedLegacySolanaTransaction(
        serializedMessage,
        from,
        new Uint8Array(32),
      ),
    ).toThrow(InvalidSolanaSignatureError);
  });

  it("rejects malformed serialized message", async () => {
    expect(() =>
      assembleSignedLegacySolanaTransaction(
        new Uint8Array([0, 1, 2]),
        from,
        new Uint8Array(64),
      ),
    ).toThrow(InvalidSolanaMessageError);
  });

  it("fails verification when message bytes change after signing", async () => {
    const originalMessage = buildLegacyTransferMessage(from, to);
    const tamperedMessage = buildLegacyTransferMessage(from, from);
    const signature = await signMessageForAccount(
      TEST_MNEMONIC,
      0,
      originalMessage,
    );

    expect(() =>
      assembleSignedLegacySolanaTransaction(tamperedMessage, from, signature),
    ).toThrow(/Signature verification failed/i);
  });
});

describe("validateLegacySigner", () => {
  const from = getSolanaAddress(TEST_MNEMONIC, 0);
  const to = getSolanaAddress(TEST_MNEMONIC, 1);

  it("accepts the expected fee payer signer", () => {
    const serializedMessage = buildLegacyTransferMessage(from, to);
    expect(() =>
      validateLegacySigner({
        serializedMessage,
        signerAddress: from,
        expectedSignerAddress: from,
      }),
    ).not.toThrow();
  });

  it("rejects signer mismatch against expectedSignerAddress", () => {
    const serializedMessage = buildLegacyTransferMessage(from, to);
    expect(() =>
      validateLegacySigner({
        serializedMessage,
        signerAddress: from,
        expectedSignerAddress: to,
      }),
    ).toThrow(SolanaSignerMismatchError);
  });

  it("rejects signer not present in required signer keys", () => {
    const serializedMessage = buildLegacyTransferMessage(from, to);
    const unrelated = getSolanaAddress(TEST_MNEMONIC, 2);
    expect(() =>
      validateLegacySigner({
        serializedMessage,
        signerAddress: unrelated,
        expectedSignerAddress: unrelated,
      }),
    ).toThrow(SolanaSignerNotRequiredError);
  });

  it("rejects malformed serialized message", () => {
    expect(() =>
      validateLegacySigner({
        serializedMessage: new Uint8Array([9, 9, 9]),
        signerAddress: from,
        expectedSignerAddress: from,
      }),
    ).toThrow(InvalidSolanaMessageError);
  });
});

describe("signSolanaTransaction worker", () => {
  beforeEach(async () => {
    resetDBConnection();
    await clearVault();
    await cryptoWorkerService.lockVault();
  });

  it("rejects signing when locked", async () => {
    const from = getSolanaAddress(TEST_MNEMONIC, 0);
    const to = getSolanaAddress(TEST_MNEMONIC, 1);
    const serializedMessage = buildLegacyTransferMessage(from, to);

    await expect(
      cryptoWorkerService.signSolanaTransaction({
        accountIndex: 0,
        serializedMessage,
        expectedSignerAddress: from,
      }),
    ).rejects.toThrow(WorkerLockedError);
  });

  it("returns a typed full signed transaction for the correct account", async () => {
    await cryptoWorkerService.importVault("password", TEST_MNEMONIC);
    const from = getSolanaAddress(TEST_MNEMONIC, 0);
    const to = getSolanaAddress(TEST_MNEMONIC, 1);
    const serializedMessage = buildLegacyTransferMessage(from, to);

    const signed = await cryptoWorkerService.signSolanaTransaction({
      accountIndex: 0,
      serializedMessage,
      expectedSignerAddress: from,
    });

    expect(signed.transactionVersion).toBe("legacy");
    expect(signed.encoding).toBe("base64");
    expect(signed.wireTransaction.length).toBeGreaterThan(0);

    const wireBytes = base64ToBytes(signed.wireTransaction);
    const parsed = Transaction.from(wireBytes);
    expect(parsed.verifySignatures()).toBe(true);
  });

  it("rejects wrong account index for the prepared message", async () => {
    await cryptoWorkerService.importVault("password", TEST_MNEMONIC);
    const from = getSolanaAddress(TEST_MNEMONIC, 0);
    const to = getSolanaAddress(TEST_MNEMONIC, 1);
    const serializedMessage = buildLegacyTransferMessage(from, to);
    const wrongAccount = getSolanaAddress(TEST_MNEMONIC, 1);

    await expect(
      cryptoWorkerService.signSolanaTransaction({
        accountIndex: 1,
        serializedMessage,
        expectedSignerAddress: wrongAccount,
      }),
    ).rejects.toThrow(SolanaSignerNotRequiredError);
  });
});
