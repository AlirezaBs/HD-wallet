import { openDB, type IDBPDatabase } from "idb";
import type { EncryptedVault, VaultMetadata } from "./types.js";
import {
  METADATA_KEY,
  VAULT_DB_NAME,
  VAULT_KEY,
  VAULT_STORE_NAME,
} from "./types.js";

type VaultDB = {
  vault: {
    key: string;
    value: EncryptedVault | VaultMetadata;
  };
};

let dbPromise: Promise<IDBPDatabase<VaultDB>> | null = null;

function getDB(): Promise<IDBPDatabase<VaultDB>> {
  if (!dbPromise) {
    dbPromise = openDB<VaultDB>(VAULT_DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(VAULT_STORE_NAME)) {
          db.createObjectStore(VAULT_STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function saveEncryptedVault(vault: EncryptedVault): Promise<void> {
  const db = await getDB();
  await db.put(VAULT_STORE_NAME, vault, VAULT_KEY);
}

export async function loadEncryptedVault(): Promise<EncryptedVault | null> {
  const db = await getDB();
  const vault = await db.get(VAULT_STORE_NAME, VAULT_KEY);
  if (!vault || !("payload" in vault)) return null;
  return vault as EncryptedVault;
}

export async function saveVaultMetadata(
  metadata: VaultMetadata,
): Promise<void> {
  const db = await getDB();
  await db.put(VAULT_STORE_NAME, metadata, METADATA_KEY);
}

export async function loadVaultMetadata(): Promise<VaultMetadata> {
  const db = await getDB();
  const metadata = await db.get(VAULT_STORE_NAME, METADATA_KEY);
  if (!metadata || !("hasVault" in metadata)) {
    return {
      hasVault: false,
      vaultVersion: 0,
      createdAt: "",
      updatedAt: "",
    };
  }
  return metadata as VaultMetadata;
}

const EMPTY_METADATA: VaultMetadata = {
  hasVault: false,
  vaultVersion: 0,
  createdAt: "",
  updatedAt: "",
};

export async function clearVault(): Promise<void> {
  const db = await getDB();
  await db.delete(VAULT_STORE_NAME, VAULT_KEY);
  await db.delete(VAULT_STORE_NAME, METADATA_KEY);
  await db.put(VAULT_STORE_NAME, EMPTY_METADATA, METADATA_KEY);
}

/** Reset DB connection — for tests */
export function resetDBConnection(): void {
  dbPromise = null;
}
