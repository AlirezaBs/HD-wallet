export interface EncryptedVault {
  version: 1;
  createdAt: string;
  updatedAt: string;
  kdf: {
    name: "argon2id";
    memoryKiB: number;
    iterations: number;
    parallelism: number;
    salt: string;
  };
  cipher: {
    name: "aes-256-gcm";
    iv: string;
    tagLength: 128;
  };
  payload: string;
}

export interface VaultPayload {
  mnemonic: string;
  evmAccountCount: number;
  solanaAccountCount: number;
  /** Index-aligned paired labels; new vaults use `[]`; legacy may omit. */
  accountLabels?: string[];
}

export type VaultMetadata = {
  hasVault: boolean;
  vaultVersion: number;
  createdAt: string;
  updatedAt: string;
};

export const DEFAULT_KDF_PARAMS = {
  memoryKiB: 65536,
  iterations: 3,
  parallelism: 4,
} as const;

export const VAULT_DB_NAME = "hd-wallet";
export const VAULT_STORE_NAME = "vault";
export const METADATA_KEY = "metadata";
export const VAULT_KEY = "encrypted-vault";
