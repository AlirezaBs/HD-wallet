import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  SolanaBlockhashExpiredError,
  SolanaConfirmationFailedError,
} from "../crypto/errors.js";
import {
  confirmSolanaTransaction,
  submitSignedSolanaTransaction,
} from "../chains/solana/broadcast.js";
import { mapSolanaRpcError } from "../chains/solana/errors.js";
import {
  saveActivity,
  updateActivityStatus,
  loadActivities,
  clearActivities,
} from "../vault/activity.js";
import type { SignedSolanaTransaction } from "../chains/solana/types.js";

const sendEncodedTransaction = vi.fn();
const confirmTransaction = vi.fn();

vi.mock("@solana/web3.js", async () => {
  const actual =
    await vi.importActual<typeof import("@solana/web3.js")>("@solana/web3.js");
  return {
    ...actual,
    Connection: class MockConnection {
      sendEncodedTransaction = sendEncodedTransaction;
      confirmTransaction = confirmTransaction;
    },
  };
});

const signedTx: SignedSolanaTransaction = {
  transactionVersion: "legacy",
  encoding: "base64",
  wireTransaction: "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
};

describe("Solana broadcast helpers", () => {
  beforeEach(() => {
    sendEncodedTransaction.mockReset();
    confirmTransaction.mockReset();
  });

  it("submits the exact signed wire transaction", async () => {
    sendEncodedTransaction.mockResolvedValue("test-signature");

    const signature = await submitSignedSolanaTransaction(signedTx, "testnet");

    expect(signature).toBe("test-signature");
    expect(sendEncodedTransaction).toHaveBeenCalledWith(
      signedTx.wireTransaction,
      {
        skipPreflight: false,
      },
    );
  });

  it("confirms with the original blockhash context", async () => {
    confirmTransaction.mockResolvedValue({ value: { err: null } });

    await confirmSolanaTransaction(
      "test-signature",
      { blockhash: "abc123", lastValidBlockHeight: 42 },
      "testnet",
    );

    expect(confirmTransaction).toHaveBeenCalledWith(
      {
        signature: "test-signature",
        blockhash: "abc123",
        lastValidBlockHeight: 42,
      },
      "confirmed",
    );
  });

  it("throws when confirmation returns an on-chain error", async () => {
    confirmTransaction.mockResolvedValue({
      value: { err: { InstructionError: [0, "Custom"] } },
    });

    await expect(
      confirmSolanaTransaction(
        "test-signature",
        { blockhash: "abc123", lastValidBlockHeight: 42 },
        "testnet",
      ),
    ).rejects.toThrow(SolanaConfirmationFailedError);
  });

  it("maps blockhash expiry errors to SolanaBlockhashExpiredError", () => {
    const mapped = mapSolanaRpcError(new Error("blockhash not found"));
    expect(mapped).toBeInstanceOf(SolanaBlockhashExpiredError);
  });

  it("preserves unknown RPC errors", () => {
    const original = new Error("custom rpc failure");
    const mapped = mapSolanaRpcError(original);
    expect(mapped).toBe(original);
  });

  it("maps submit expiry errors to SolanaBlockhashExpiredError", async () => {
    sendEncodedTransaction.mockRejectedValue(new Error("Transaction expired"));

    await expect(
      submitSignedSolanaTransaction(signedTx, "testnet"),
    ).rejects.toThrow(SolanaBlockhashExpiredError);
  });
});

describe("activity lifecycle", () => {
  beforeEach(async () => {
    await clearActivities();
  });

  it("saves pending activity and updates to confirmed", async () => {
    await saveActivity({
      id: "sig-1",
      chainFamily: "solana",
      type: "send",
      hash: "sig-1",
      from: "from",
      to: "to",
      amount: "1",
      status: "pending",
      timestamp: Date.now(),
      explorerUrl: "https://example.com/tx/sig-1",
    });

    await updateActivityStatus("sig-1", "confirmed");
    const activities = await loadActivities();
    expect(activities[0]?.status).toBe("confirmed");
  });

  it("updates pending activity to failed", async () => {
    await saveActivity({
      id: "sig-2",
      chainFamily: "solana",
      type: "send",
      hash: "sig-2",
      from: "from",
      to: "to",
      amount: "1",
      status: "pending",
      timestamp: Date.now(),
      explorerUrl: "https://example.com/tx/sig-2",
    });

    await updateActivityStatus("sig-2", "failed");
    const activities = await loadActivities();
    expect(activities[0]?.status).toBe("failed");
  });
});
