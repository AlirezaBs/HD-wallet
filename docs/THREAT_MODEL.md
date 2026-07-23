# Threat Model

## Assets

- BIP39 mnemonic (master secret)
- Derived private keys (EVM secp256k1, Solana ed25519)
- Encryption key (derived from password via Argon2id)
- Encrypted vault blob in IndexedDB

## Trust Boundaries

| Boundary             | Trusted Side              | Untrusted Side              |
| -------------------- | ------------------------- | --------------------------- |
| Main thread ↔ Worker | Worker holds secrets      | Main thread, React, Zustand |
| App ↔ IndexedDB      | Encrypted ciphertext only | Plaintext never persisted   |
| App ↔ RPC            | Public chain data         | RPC operators (MITM risk)   |

## Threats

### T1: XSS steals secrets from memory

- **Impact:** Critical — attacker reads mnemonic from worker memory
- **Mitigation:** CSP headers, no `dangerouslySetInnerHTML`, dependency audit, minimal attack surface

### T2: Malicious browser extension reads password field

- **Impact:** High — password captured at unlock
- **Mitigation:** Document limitation; recommend dedicated browser profile

### T3: Weak user password

- **Impact:** Medium — offline brute-force of stolen vault
- **Mitigation:** Argon2id (64 MiB, 3 iterations), password strength meter

### T4: RPC MITM

- **Impact:** Medium — fake balances, tx redirection
- **Mitigation:** HTTPS only, user warnings for custom RPC

### T5: Clipboard sniffing

- **Impact:** Low-Medium — address/seed copied to clipboard
- **Mitigation:** 30s auto-clear, seed copy warnings

### T6: Memory not zeroed in JavaScript

- **Impact:** Low — best-effort clear on lock
- **Mitigation:** `lockVault()` clears references; document in SECURITY.md

## Out of Scope (v1)

- Hardware wallet integration
- dApp injection / WalletConnect
- Professional security audit
