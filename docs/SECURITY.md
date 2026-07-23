# Security

## Crypto Stack

| Component   | Implementation                                           |
| ----------- | -------------------------------------------------------- |
| KDF         | Argon2id via hash-wasm (64 MiB, 3 iter, parallelism 4)   |
| Symmetric   | AES-256-GCM via Web Crypto API                           |
| EVM keys    | BIP39 + BIP32 secp256k1 (`@scure/bip39`, `@scure/bip32`) |
| Solana keys | BIP39 + SLIP-0010 ed25519 (`@noble/hashes` HMAC-SHA512)  |
| Signing     | Inside dedicated Web Worker only                         |

## Rules

1. Password never stored in Zustand — flows directly from form to worker
2. Mnemonic/private keys never leave worker except encrypted ciphertext
3. `PublicWalletState` is the only wallet data React receives
4. Vault metadata checked for routing without decryption
5. `lockVault()` clears worker memory; signing fails when locked
6. Transaction signing requires explicit user confirmation dialog
7. Never broadcast without separate user confirmation

## Storage

- Encrypted vault: IndexedDB (`hd-wallet` database)
- Settings/theme: localStorage (non-secret)
- Session state: in-memory Zustand (not persisted)

## Clipboard

Addresses copied with 30-second auto-clear.

## Reporting Vulnerabilities

Please open a GitHub issue with security label or email maintainers privately.

See also: [THREAT_MODEL.md](./THREAT_MODEL.md), [VAULT_FORMAT.md](./VAULT_FORMAT.md)
