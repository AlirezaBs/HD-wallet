import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  CannotRemoveAccountError,
  InvalidAccountIndexError,
  InvalidAccountLabelError,
  WorkerLockedError,
} from "../crypto/errors.js";
import { cryptoWorkerService } from "../crypto/worker-service.js";
import * as vaultService from "../vault/vault-service.js";
import {
  clearVault,
  loadEncryptedVault,
  resetDBConnection,
  saveEncryptedVault,
  saveVaultMetadata,
} from "../vault/storage.js";
import {
  getAvailableAccountCount,
  normalizeAccountLabel,
  resolveAccountLabel,
  MAX_ACCOUNT_LABEL_CODE_POINTS,
} from "../wallet/account-labels.js";
import {
  buildPublicWalletState,
  createInitialPayload,
} from "../wallet/state.js";
import type { VaultPayload } from "../vault/types.js";

const TEST_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const PASSWORD = "test-password-labels";

type WorkerInternals = {
  payload: VaultPayload | null;
  encryptionKey: Uint8Array | null;
  unlocked: boolean;
};

function workerInternals(): WorkerInternals {
  return cryptoWorkerService as unknown as WorkerInternals;
}

describe("normalizeAccountLabel", () => {
  it("accepts 1 code point", () => {
    expect(normalizeAccountLabel("A")).toBe("A");
  });

  it("accepts exactly 32 code points", () => {
    const label = "a".repeat(MAX_ACCOUNT_LABEL_CODE_POINTS);
    expect(normalizeAccountLabel(label)).toBe(label);
  });

  it("rejects 33 code points", () => {
    const label = "a".repeat(MAX_ACCOUNT_LABEL_CODE_POINTS + 1);
    expect(() => normalizeAccountLabel(label)).toThrow(
      InvalidAccountLabelError,
    );
  });

  it("accepts emoji within the code-point limit", () => {
    expect(normalizeAccountLabel("Savings 💰")).toBe("Savings 💰");
  });

  it("rejects whitespace-only labels", () => {
    expect(() => normalizeAccountLabel("   ")).toThrow(
      InvalidAccountLabelError,
    );
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeAccountLabel("  Main  ")).toBe("Main");
  });
});

describe("resolveAccountLabel", () => {
  it("defaults missing entry to Account N", () => {
    expect(resolveAccountLabel(["Main"], 1)).toBe("Account 2");
  });

  it("defaults empty string to Account N", () => {
    expect(resolveAccountLabel([""], 0)).toBe("Account 1");
  });

  it("defaults whitespace-only stored value to Account N", () => {
    expect(resolveAccountLabel(["   "], 0)).toBe("Account 1");
  });

  it("defaults non-string stored values to Account N", () => {
    expect(resolveAccountLabel([42 as unknown as string], 0)).toBe("Account 1");
    expect(resolveAccountLabel([null], 0)).toBe("Account 1");
    expect(resolveAccountLabel("not-an-array", 0)).toBe("Account 1");
  });

  it("returns trimmed valid custom values", () => {
    expect(resolveAccountLabel(["  Trading  "], 0)).toBe("Trading");
  });
});

describe("getAvailableAccountCount", () => {
  it("returns equal counts", () => {
    expect(
      getAvailableAccountCount({
        mnemonic: TEST_MNEMONIC,
        evmAccountCount: 3,
        solanaAccountCount: 3,
      }),
    ).toBe(3);
  });

  it("returns Math.max for unequal counts", () => {
    expect(
      getAvailableAccountCount({
        mnemonic: TEST_MNEMONIC,
        evmAccountCount: 4,
        solanaAccountCount: 2,
      }),
    ).toBe(4);
  });
});

describe("buildPublicWalletState labels", () => {
  it("applies the same resolved label to EVM and Solana", () => {
    const state = buildPublicWalletState(TEST_MNEMONIC, {
      mnemonic: TEST_MNEMONIC,
      evmAccountCount: 2,
      solanaAccountCount: 2,
      accountLabels: ["Main"],
    });
    expect(state.evmAccounts[0]?.name).toBe("Main");
    expect(state.solanaAccounts[0]?.name).toBe("Main");
    expect(state.evmAccounts[1]?.name).toBe("Account 2");
    expect(state.solanaAccounts[1]?.name).toBe("Account 2");
  });

  it("defaults when accountLabels is missing", () => {
    const state = buildPublicWalletState(TEST_MNEMONIC, {
      mnemonic: TEST_MNEMONIC,
      evmAccountCount: 1,
      solanaAccountCount: 1,
    });
    expect(state.evmAccounts[0]?.name).toBe("Account 1");
    expect(state.solanaAccounts[0]?.name).toBe("Account 1");
  });
});

describe("createInitialPayload", () => {
  it("writes accountLabels as an empty array", () => {
    expect(createInitialPayload(TEST_MNEMONIC).accountLabels).toEqual([]);
  });
});

describe("renameAccount worker", () => {
  beforeEach(async () => {
    resetDBConnection();
    await clearVault();
    await cryptoWorkerService.lockVault();
    vi.restoreAllMocks();
  });

  async function unlockFresh() {
    await cryptoWorkerService.importVault(PASSWORD, TEST_MNEMONIC);
  }

  it("round-trips labels across lock and unlock", async () => {
    await unlockFresh();
    await cryptoWorkerService.renameAccount(0, "Spending");
    await cryptoWorkerService.lockVault();
    const state = await cryptoWorkerService.unlockVault(PASSWORD);
    expect(state.evmAccounts[0]?.name).toBe("Spending");
    expect(state.solanaAccounts[0]?.name).toBe("Spending");
  });

  it("pads labels without corrupting earlier entries", async () => {
    await unlockFresh();
    await cryptoWorkerService.addAccount("evm");
    await cryptoWorkerService.addAccount("solana");
    await cryptoWorkerService.addAccount("evm");
    await cryptoWorkerService.addAccount("solana");
    await cryptoWorkerService.renameAccount(0, "Main");
    await cryptoWorkerService.renameAccount(2, "Trading");

    const internals = workerInternals();
    expect(internals.payload?.accountLabels).toEqual(["Main", "", "Trading"]);

    const state = buildPublicWalletState(
      TEST_MNEMONIC,
      internals.payload as VaultPayload,
    );
    expect(state.evmAccounts[0]?.name).toBe("Main");
    expect(state.evmAccounts[1]?.name).toBe("Account 2");
    expect(state.evmAccounts[2]?.name).toBe("Trading");
  });

  it("rename of one index does not change another", async () => {
    await unlockFresh();
    await cryptoWorkerService.addAccount("evm");
    await cryptoWorkerService.addAccount("solana");
    await cryptoWorkerService.renameAccount(0, "Alpha");
    await cryptoWorkerService.renameAccount(1, "Beta");
    await cryptoWorkerService.renameAccount(0, "Alpha2");

    const labels = workerInternals().payload?.accountLabels;
    expect(labels?.[0]).toBe("Alpha2");
    expect(labels?.[1]).toBe("Beta");
  });

  it("preserves mnemonic, counts, addresses, and envelope version", async () => {
    await unlockFresh();
    const before = workerInternals().payload!;
    const beforeVault = await loadEncryptedVault();
    const beforeCreatedAt = beforeVault!.createdAt;
    const beforeAddresses = buildPublicWalletState(before.mnemonic, before);

    await cryptoWorkerService.renameAccount(0, "Renamed");

    const after = workerInternals().payload!;
    expect(after.mnemonic).toBe(before.mnemonic);
    expect(after.evmAccountCount).toBe(before.evmAccountCount);
    expect(after.solanaAccountCount).toBe(before.solanaAccountCount);

    const afterState = buildPublicWalletState(after.mnemonic, after);
    expect(afterState.evmAccounts[0]?.address).toBe(
      beforeAddresses.evmAccounts[0]?.address,
    );
    expect(afterState.solanaAccounts[0]?.address).toBe(
      beforeAddresses.solanaAccounts[0]?.address,
    );
    expect(afterState.evmAccounts[0]?.path).toBe(
      beforeAddresses.evmAccounts[0]?.path,
    );

    const afterVault = await loadEncryptedVault();
    expect(afterVault?.version).toBe(1);
    expect(afterVault?.createdAt).toBe(beforeCreatedAt);
  });

  it("rolls back all worker fields when persistence fails", async () => {
    await unlockFresh();
    const before = workerInternals();
    const beforePayload = structuredClone(before.payload);
    const beforeKey = before.encryptionKey!;
    const beforeKeyCopy = beforeKey.slice();
    const beforeUnlocked = before.unlocked;

    vi.spyOn(vaultService, "updateVaultWithKey").mockRejectedValueOnce(
      new Error("persist failed"),
    );

    await expect(
      cryptoWorkerService.renameAccount(0, "ShouldFail"),
    ).rejects.toThrow("persist failed");

    const after = workerInternals();
    expect(after.payload).toEqual(beforePayload);
    expect(after.encryptionKey).toBe(beforeKey);
    expect(Array.from(after.encryptionKey!)).toEqual(Array.from(beforeKeyCopy));
    expect(after.unlocked).toBe(beforeUnlocked);
    expect(cryptoWorkerService.isUnlocked()).toBe(true);
  });

  it("rejects rename when locked", async () => {
    await expect(cryptoWorkerService.renameAccount(0, "Nope")).rejects.toThrow(
      WorkerLockedError,
    );
  });

  it("rejects invalid account index", async () => {
    await unlockFresh();
    await expect(cryptoWorkerService.renameAccount(5, "Nope")).rejects.toThrow(
      InvalidAccountIndexError,
    );
    await expect(
      cryptoWorkerService.renameAccount(1.5, "Nope"),
    ).rejects.toThrow(InvalidAccountIndexError);
  });

  it("rejects empty label input", async () => {
    await unlockFresh();
    await expect(cryptoWorkerService.renameAccount(0, "  ")).rejects.toThrow(
      InvalidAccountLabelError,
    );
  });

  it("does not persist when unlocking a legacy vault without accountLabels", async () => {
    const legacyPayload: VaultPayload = {
      mnemonic: TEST_MNEMONIC,
      evmAccountCount: 1,
      solanaAccountCount: 1,
    };
    const vault = await vaultService.encryptVault(PASSWORD, legacyPayload);
    await saveEncryptedVault(vault);
    await saveVaultMetadata({
      hasVault: true,
      vaultVersion: vault.version,
      createdAt: vault.createdAt,
      updatedAt: vault.updatedAt,
    });

    const updateSpy = vi.spyOn(vaultService, "updateVaultWithKey");
    const saveSpy = vi.spyOn(
      await import("../vault/storage.js"),
      "saveEncryptedVault",
    );

    const state = await cryptoWorkerService.unlockVault(PASSWORD);
    expect(state.evmAccounts[0]?.name).toBe("Account 1");
    expect(updateSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });
});

describe("paired addAccount preserves labels", () => {
  beforeEach(async () => {
    resetDBConnection();
    await clearVault();
    await cryptoWorkerService.lockVault();
    vi.restoreAllMocks();
  });

  it("preserves labels through the UI EVM-then-Solana add sequence", async () => {
    await cryptoWorkerService.importVault(PASSWORD, TEST_MNEMONIC);
    await cryptoWorkerService.addAccount("evm");
    await cryptoWorkerService.addAccount("solana");
    await cryptoWorkerService.addAccount("evm");
    await cryptoWorkerService.addAccount("solana");
    await cryptoWorkerService.renameAccount(0, "Main");
    await cryptoWorkerService.renameAccount(2, "Trading");

    expect(workerInternals().payload?.accountLabels).toEqual([
      "Main",
      "",
      "Trading",
    ]);

    let state = await cryptoWorkerService.addAccount("evm");
    state = await cryptoWorkerService.addAccount("solana");

    const after = workerInternals().payload!;
    expect(after.accountLabels).toEqual(["Main", "", "Trading"]);
    expect(after.evmAccountCount).toBe(4);
    expect(after.solanaAccountCount).toBe(4);
    expect(state.evmAccounts[3]?.name).toBe("Account 4");
    expect(state.solanaAccounts[3]?.name).toBe("Account 4");
    expect(state.evmAccounts[0]?.name).toBe("Main");
    expect(state.evmAccounts[2]?.name).toBe("Trading");

    const renamed = await cryptoWorkerService.renameAccount(3, "New");
    expect(renamed.evmAccounts[3]?.name).toBe("New");
    expect(renamed.solanaAccounts[3]?.name).toBe("New");
    expect(workerInternals().payload?.accountLabels?.[0]).toBe("Main");
  });

  it("importVault initializes accountLabels to []", async () => {
    await cryptoWorkerService.importVault(PASSWORD, TEST_MNEMONIC);
    expect(workerInternals().payload?.accountLabels).toEqual([]);
  });
});

describe("removeLastAccount", () => {
  beforeEach(async () => {
    resetDBConnection();
    await clearVault();
    await cryptoWorkerService.lockVault();
    vi.restoreAllMocks();
  });

  it("rejects removing the only account", async () => {
    await cryptoWorkerService.importVault(PASSWORD, TEST_MNEMONIC);
    await expect(cryptoWorkerService.removeLastAccount()).rejects.toThrow(
      CannotRemoveAccountError,
    );
  });

  it("removes the last paired account and truncates labels", async () => {
    await cryptoWorkerService.importVault(PASSWORD, TEST_MNEMONIC);
    await cryptoWorkerService.addAccount("evm");
    await cryptoWorkerService.addAccount("solana");
    await cryptoWorkerService.addAccount("evm");
    await cryptoWorkerService.addAccount("solana");
    await cryptoWorkerService.renameAccount(0, "Main");
    await cryptoWorkerService.renameAccount(2, "Trading");

    const state = await cryptoWorkerService.removeLastAccount();
    expect(state.evmAccounts).toHaveLength(2);
    expect(state.solanaAccounts).toHaveLength(2);
    expect(state.evmAccounts[0]?.name).toBe("Main");
    expect(state.evmAccounts[1]?.name).toBe("Account 2");
    expect(workerInternals().payload?.accountLabels).toEqual(["Main", ""]);
  });

  it("rejects when locked", async () => {
    await expect(cryptoWorkerService.removeLastAccount()).rejects.toThrow(
      WorkerLockedError,
    );
  });
});
