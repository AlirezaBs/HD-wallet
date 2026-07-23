import {
  createDefaultKdfParams,
  deriveKey,
  kdfParamsToVault,
  vaultToKdfParams,
} from "../crypto/kdf.js";
import {
  encrypt,
  decrypt,
  stringToBytes,
  bytesToString,
} from "../crypto/cipher.js";
import { WrongPasswordError, VaultExistsError } from "../crypto/errors.js";
import type { EncryptedVault, VaultPayload } from "./types.js";
import {
  saveEncryptedVault,
  loadEncryptedVault,
  saveVaultMetadata,
} from "./storage.js";
import { getVaultMetadata } from "./metadata.js";

export async function encryptVault(
  password: string,
  payload: VaultPayload,
): Promise<EncryptedVault> {
  const kdfParams = createDefaultKdfParams();
  const key = await deriveKey(password, kdfParams);
  const plaintext = stringToBytes(JSON.stringify(payload));
  const { iv, ciphertext } = await encrypt(key, plaintext);
  const now = new Date().toISOString();

  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    kdf: kdfParamsToVault(kdfParams),
    cipher: {
      name: "aes-256-gcm",
      iv,
      tagLength: 128,
    },
    payload: ciphertext,
  };
}

export async function decryptVault(
  password: string,
  vault: EncryptedVault,
): Promise<VaultPayload> {
  const kdfParams = vaultToKdfParams(vault);
  const key = await deriveKey(password, kdfParams);

  try {
    const plaintext = await decrypt(key, vault.cipher.iv, vault.payload);
    return JSON.parse(bytesToString(plaintext)) as VaultPayload;
  } catch {
    throw new WrongPasswordError();
  }
}

export async function persistVault(
  password: string,
  payload: VaultPayload,
): Promise<EncryptedVault> {
  const metadata = await getVaultMetadata();
  if (metadata.hasVault) {
    throw new VaultExistsError();
  }

  const vault = await encryptVault(password, payload);
  await saveEncryptedVault(vault);
  await saveVaultMetadata({
    hasVault: true,
    vaultVersion: vault.version,
    createdAt: vault.createdAt,
    updatedAt: vault.updatedAt,
  });
  return vault;
}

export async function updateVault(
  password: string,
  payload: VaultPayload,
): Promise<void> {
  const existing = await loadEncryptedVault();
  if (!existing) {
    throw new Error("No vault found");
  }

  const vault = await encryptVault(password, payload);
  vault.createdAt = existing.createdAt;
  await saveEncryptedVault(vault);
  await saveVaultMetadata({
    hasVault: true,
    vaultVersion: vault.version,
    createdAt: existing.createdAt,
    updatedAt: vault.updatedAt,
  });
}

export async function updateVaultWithKey(
  key: Uint8Array,
  payload: VaultPayload,
): Promise<void> {
  const existing = await loadEncryptedVault();
  if (!existing) {
    throw new Error("No vault found");
  }

  const plaintext = stringToBytes(JSON.stringify(payload));
  const { iv, ciphertext } = await encrypt(key, plaintext);
  const now = new Date().toISOString();

  const vault: EncryptedVault = {
    ...existing,
    updatedAt: now,
    cipher: {
      name: "aes-256-gcm",
      iv,
      tagLength: 128,
    },
    payload: ciphertext,
  };

  await saveEncryptedVault(vault);
  await saveVaultMetadata({
    hasVault: true,
    vaultVersion: vault.version,
    createdAt: existing.createdAt,
    updatedAt: now,
  });
}

export async function unlockVaultPayload(
  password: string,
): Promise<VaultPayload> {
  const vault = await loadEncryptedVault();
  if (!vault) {
    throw new Error("No vault found");
  }
  return decryptVault(password, vault);
}
