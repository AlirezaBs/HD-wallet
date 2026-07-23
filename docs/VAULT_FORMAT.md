# Vault Format (v1)

## EncryptedVault

Stored in IndexedDB under key `encrypted-vault`.

`version` is the **encryption envelope** format (KDF/cipher/ciphertext layout). It remains `1` for backward-compatible additive fields inside the decrypted JSON payload.

```typescript
interface EncryptedVault {
  version: 1;
  createdAt: string; // ISO 8601
  updatedAt: string;
  kdf: {
    name: "argon2id";
    memoryKiB: number; // default 65536
    iterations: number; // default 3
    parallelism: number; // default 4
    salt: string; // base64, 16 bytes
  };
  cipher: {
    name: "aes-256-gcm";
    iv: string; // base64, 12 bytes
    tagLength: 128;
  };
  payload: string; // base64 ciphertext + auth tag
}
```

## Decrypted Payload (worker memory only)

```typescript
interface VaultPayload {
  mnemonic: string;
  evmAccountCount: number;
  solanaAccountCount: number;
  /**
   * Index-aligned labels for paired accounts (same index → EVM + Solana).
   * New vaults write `[]`. Legacy vaults may omit the field.
   */
  accountLabels?: string[];
}
```

### Account labels

- Index `i` is the paired account index used in the UI account switcher.
- One label applies to both EVM and Solana public accounts at that index.
- Non-empty string → custom display name.
- Missing array, missing entry, empty string, whitespace-only, or non-string stored value → default `Account ${i + 1}` when resolving for display (compatibility-first).
- On rename write: trim; reject empty/whitespace-only; max **32 Unicode code points** (`Array.from(trimmed).length`).
- Rename may pad intermediate indexes with `""` when writing a later index.
- Unlocking a legacy vault that omits `accountLabels` does **not** rewrite the vault; the field is treated as `[]` in memory only.
- The field is serialized into ciphertext on a real payload mutation (for example rename, add-account, or remove-last-account).

### Removing accounts

- Only the **last paired account** can be removed (both EVM and Solana counts shrink together).
- Counts become `min(evmAccountCount, solanaAccountCount) - 1` (never below 1).
- `accountLabels` is truncated to the new count.
- The sole remaining account cannot be removed.

## VaultMetadata

Stored separately under key `metadata`. Used for routing without decryption.

```typescript
type VaultMetadata = {
  hasVault: boolean;
  vaultVersion: number;
  createdAt: string;
  updatedAt: string;
};
```

## Key Derivation

1. User password + salt → **Argon2id** (via hash-wasm) → 256-bit AES key
2. VaultPayload JSON → **AES-256-GCM** (via Web Crypto API) → base64 payload

## HD Paths

- EVM account n: `m/44'/60'/0'/0/{n}`
- Solana account n: `m/44'/501'/{n}'/0'` (SLIP-0010 ed25519)
