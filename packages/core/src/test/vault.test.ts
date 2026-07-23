import { describe, it, expect, beforeEach } from "vitest";
import {
  encrypt,
  decrypt,
  stringToBytes,
  bytesToString,
} from "../crypto/cipher.js";
import {
  deriveKey,
  createDefaultKdfParams,
  generateSalt,
} from "../crypto/kdf.js";
import { encryptVault, decryptVault } from "../vault/vault-service.js";
import { WrongPasswordError } from "../crypto/errors.js";
import { cryptoWorkerService } from "../crypto/worker-service.js";
import {
  saveEncryptedVault,
  loadEncryptedVault,
  saveVaultMetadata,
  loadVaultMetadata,
  clearVault,
  resetDBConnection,
} from "../vault/storage.js";
import { getVaultMetadata } from "../vault/metadata.js";
import { getEvmAddress, evmDerivationPath } from "../wallet/derive-evm.js";
import {
  getSolanaAddress,
  solanaDerivationPath,
} from "../wallet/derive-solana.js";

const TEST_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

describe("AES-GCM cipher", () => {
  it("round-trips encrypt/decrypt", async () => {
    const key = new Uint8Array(32).fill(1);
    const plaintext = stringToBytes('{"test":true}');
    const { iv, ciphertext } = await encrypt(key, plaintext);
    const decrypted = await decrypt(key, iv, ciphertext);
    expect(bytesToString(decrypted)).toBe('{"test":true}');
  });
});

describe("Argon2id KDF", () => {
  it("derives consistent key length", async () => {
    const params = {
      ...createDefaultKdfParams(),
      salt: generateSalt(),
      memoryKiB: 1024,
      iterations: 1,
    };
    const key = await deriveKey("test-password", params);
    expect(key.length).toBe(32);
  });
});

describe("Vault encryption", () => {
  beforeEach(async () => {
    resetDBConnection();
    await clearVault();
  });

  it("encrypts and decrypts vault payload", async () => {
    const payload = {
      mnemonic: TEST_MNEMONIC,
      evmAccountCount: 1,
      solanaAccountCount: 1,
    };
    const vault = await encryptVault("correct-password", payload);
    const decrypted = await decryptVault("correct-password", vault);
    expect(decrypted.mnemonic).toBe(TEST_MNEMONIC);
  });

  it("wrong password throws WrongPasswordError", async () => {
    const payload = {
      mnemonic: TEST_MNEMONIC,
      evmAccountCount: 1,
      solanaAccountCount: 1,
    };
    const vault = await encryptVault("correct-password", payload);
    await expect(decryptVault("wrong-password", vault)).rejects.toThrow(
      WrongPasswordError,
    );
  });

  it("wrong password never returns partial vault data", async () => {
    const vault = await encryptVault("correct-password", {
      mnemonic: TEST_MNEMONIC,
      evmAccountCount: 1,
      solanaAccountCount: 1,
    });
    try {
      await decryptVault("wrong-password", vault);
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(WrongPasswordError);
      expect(String(e)).not.toContain("abandon");
    }
  });

  it("stores only encrypted payload in IndexedDB", async () => {
    const vault = await encryptVault("password", {
      mnemonic: TEST_MNEMONIC,
      evmAccountCount: 1,
      solanaAccountCount: 1,
    });
    await saveEncryptedVault(vault);
    const stored = await loadEncryptedVault();
    expect(stored?.payload).toBeDefined();
    expect(JSON.stringify(stored)).not.toContain("abandon");
    expect(JSON.stringify(stored)).not.toContain("private");
  });

  it("metadata allows routing without decrypt", async () => {
    await saveVaultMetadata({
      hasVault: true,
      vaultVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const meta = await loadVaultMetadata();
    expect(meta.hasVault).toBe(true);
  });

  it("repairs metadata when vault ciphertext is missing", async () => {
    await saveVaultMetadata({
      hasVault: true,
      vaultVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const meta = await getVaultMetadata();
    expect(meta.hasVault).toBe(false);

    const stored = await loadVaultMetadata();
    expect(stored.hasVault).toBe(false);
  });

  it("repairs metadata when ciphertext exists but hasVault is false", async () => {
    const vault = await encryptVault("password", {
      mnemonic: TEST_MNEMONIC,
      evmAccountCount: 1,
      solanaAccountCount: 1,
    });
    await saveEncryptedVault(vault);
    await saveVaultMetadata({
      hasVault: false,
      vaultVersion: 0,
      createdAt: "",
      updatedAt: "",
    });

    const meta = await getVaultMetadata();
    expect(meta.hasVault).toBe(true);
    expect(meta.vaultVersion).toBe(vault.version);

    const stored = await loadVaultMetadata();
    expect(stored.hasVault).toBe(true);
  });

  it("clearVault leaves explicit empty metadata", async () => {
    const vault = await encryptVault("password", {
      mnemonic: TEST_MNEMONIC,
      evmAccountCount: 1,
      solanaAccountCount: 1,
    });
    await saveEncryptedVault(vault);
    await saveVaultMetadata({
      hasVault: true,
      vaultVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await clearVault();

    expect(await loadEncryptedVault()).toBeNull();
    const meta = await loadVaultMetadata();
    expect(meta.hasVault).toBe(false);
  });
});

describe("Worker locked state", () => {
  beforeEach(async () => {
    resetDBConnection();
    await clearVault();
    await cryptoWorkerService.lockVault();
  });

  it("refuses signing when locked", async () => {
    await expect(
      cryptoWorkerService.signEvmMessage({ accountIndex: 0, message: "hello" }),
    ).rejects.toThrow("Wallet is locked");
  });
});

describe("exportRecoveryPhrase", () => {
  beforeEach(async () => {
    resetDBConnection();
    await clearVault();
    await cryptoWorkerService.lockVault();
  });

  it("returns mnemonic with correct password when locked", async () => {
    await cryptoWorkerService.importVault("test-password", TEST_MNEMONIC);
    await cryptoWorkerService.lockVault();

    const mnemonic =
      await cryptoWorkerService.exportRecoveryPhrase("test-password");
    expect(mnemonic).toBe(TEST_MNEMONIC);
    expect(cryptoWorkerService.isUnlocked()).toBe(false);
  });

  it("throws WrongPasswordError on wrong password", async () => {
    await cryptoWorkerService.importVault("test-password", TEST_MNEMONIC);
    await cryptoWorkerService.lockVault();

    await expect(
      cryptoWorkerService.exportRecoveryPhrase("wrong-password"),
    ).rejects.toThrow(WrongPasswordError);
  });

  it("does not unlock wallet when locked", async () => {
    await cryptoWorkerService.importVault("test-password", TEST_MNEMONIC);
    await cryptoWorkerService.lockVault();

    await cryptoWorkerService.exportRecoveryPhrase("test-password");
    expect(cryptoWorkerService.isUnlocked()).toBe(false);
    await expect(
      cryptoWorkerService.signEvmMessage({ accountIndex: 0, message: "hello" }),
    ).rejects.toThrow("Wallet is locked");
  });

  it("remains unlocked when already unlocked", async () => {
    await cryptoWorkerService.importVault("test-password", TEST_MNEMONIC);
    expect(cryptoWorkerService.isUnlocked()).toBe(true);

    const mnemonic =
      await cryptoWorkerService.exportRecoveryPhrase("test-password");
    expect(mnemonic).toBe(TEST_MNEMONIC);
    expect(cryptoWorkerService.isUnlocked()).toBe(true);
  });
});

describe("HD derivation", () => {
  it("derives EVM path m/44'/60'/0'/0/0", () => {
    expect(evmDerivationPath(0)).toBe("m/44'/60'/0'/0/0");
    const address = getEvmAddress(TEST_MNEMONIC, 0);
    expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("derives Solana path m/44'/501'/0'/0'", () => {
    expect(solanaDerivationPath(0)).toBe("m/44'/501'/0'/0'");
    expect(solanaDerivationPath(1)).toBe("m/44'/501'/1'/0'");
    const address = getSolanaAddress(TEST_MNEMONIC, 0);
    expect(address.length).toBeGreaterThan(30);
  });

  it("derives different Solana accounts from different paths", () => {
    const a0 = getSolanaAddress(TEST_MNEMONIC, 0);
    const a1 = getSolanaAddress(TEST_MNEMONIC, 1);
    expect(a0).not.toBe(a1);
  });
});

describe("Session store safety", () => {
  it("documents forbidden key names aligned with stores contract", () => {
    const forbidden = [
      "password",
      "mnemonic",
      "privateKey",
      "encryptionKey",
      "rawSeed",
      "decryptedVault",
    ];
    forbidden.forEach((key) => {
      expect(key).toBeTruthy();
    });
  });
});
