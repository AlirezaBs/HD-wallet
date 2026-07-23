# Architecture

## Overview

HD Wallet is a browser-based hierarchical deterministic wallet supporting EVM and Solana chains. v1 is a Vite React web app with an extension-like UI layout.

## Packages

| Package             | Purpose                                                               |
| ------------------- | --------------------------------------------------------------------- |
| `@hd-wallet/core`   | Crypto worker, vault, HD derivation, chain adapters — zero React deps |
| `@hd-wallet/stores` | Zustand stores for public/session state only                          |
| `apps/web`          | Vite React SPA                                                        |

## Crypto Boundary

```
Password form → workerClient → Web Worker (Argon2id + AES-GCM + signing)
                                    ↓
                              PublicWalletState only → Zustand
```

Secrets never touch the main thread or Zustand. See [VAULT_FORMAT.md](./VAULT_FORMAT.md) and [SECURITY.md](./SECURITY.md).

## Data Flow

1. **Routing:** `VaultMetadata` in IndexedDB determines onboarding vs unlock (no decrypt).
2. **Unlock:** Password → worker derives key → decrypts vault → returns public accounts.
3. **Send:** Main thread builds unsigned tx → preview UI → user confirms → worker signs → optional broadcast.

## UI Layout

- Max-width ~480px centered column (extension-like)
- Chain family tabs: EVM | Solana
- Bottom nav: Home | Send | Activity | Settings
