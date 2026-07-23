import {
  loadEncryptedVault,
  loadVaultMetadata,
  saveVaultMetadata,
} from "./storage.js";
import type { VaultMetadata } from "./types.js";

const EMPTY_METADATA: VaultMetadata = {
  hasVault: false,
  vaultVersion: 0,
  createdAt: "",
  updatedAt: "",
};

function metadataFromEncryptedVault(
  encrypted: NonNullable<Awaited<ReturnType<typeof loadEncryptedVault>>>,
): VaultMetadata {
  return {
    hasVault: true,
    vaultVersion: encrypted.version,
    createdAt: encrypted.createdAt,
    updatedAt: encrypted.updatedAt,
  };
}

export async function getVaultMetadata(): Promise<VaultMetadata> {
  const metadata = await loadVaultMetadata();
  const encrypted = await loadEncryptedVault();

  if (metadata.hasVault && !encrypted) {
    await saveVaultMetadata(EMPTY_METADATA);
    return EMPTY_METADATA;
  }

  if (!metadata.hasVault && encrypted) {
    const repaired = metadataFromEncryptedVault(encrypted);
    await saveVaultMetadata(repaired);
    return repaired;
  }

  return metadata;
}

export async function hasVault(): Promise<boolean> {
  const metadata = await getVaultMetadata();
  return metadata.hasVault;
}
