# @hd-wallet/core — Agent Rules

This file supplements the repository-root [`AGENTS.md`](../../AGENTS.md). Root authority, security, scope, validation, and reporting rules remain in effect.

See also [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md), [`docs/SECURITY.md`](../../docs/SECURITY.md), [`docs/VAULT_FORMAT.md`](../../docs/VAULT_FORMAT.md).

---

## Package boundaries

**Allowed:** vault, KDF, cipher, HD derivation, chain adapters, worker API.

**Forbidden:** React, Zustand, DOM APIs, or any dependency that pulls UI into core.

**Imports:** relative imports with `.js` extension (ESM `tsc` output).

New chain logic goes in `packages/core/src/chains/`, not in React components.

---

## Crypto and worker

- Crypto, vault unlock/lock, derivation, and signing logic belong in core and are exposed through the worker API.
- Secrets (mnemonic, seeds, keys, encryption key, decrypted vault) exist only in worker memory after unlock.
- Do not log secrets or secret-derived material.
- Worker contract changes (method names, payloads, lock semantics) require an approved high-risk plan and focused tests.

---

## Vault and persistence

- Encrypted vault format and decrypted payload schema are defined in [`docs/VAULT_FORMAT.md`](../../docs/VAULT_FORMAT.md).
- **Envelope `version`:** encryption envelope (KDF/cipher/ciphertext layout). Do not bump casually.
- **Additive payload fields:** backward-compatible fields with safe defaults do not require an envelope version bump when missing fields are handled safely.
- Breaking payload changes, removed fields, incompatible types, changed semantics, or envelope changes require a documented migration and appropriate version bump.
- Do not change vault formats, KDF parameters, or persistence behavior without an approved high-risk plan and focused tests.

---

## Derivation paths (protected)

Do not change without approved high-risk plan:

- EVM account n: `m/44'/60'/0'/0/{n}`
- Solana account n: `m/44'/501'/{n}'/0'` (SLIP-0010 ed25519)

---

## Errors and TypeScript

- Prefer custom error classes (`WorkerLockedError`, `WrongPasswordError`, etc.).
- Throw for exceptional cases; return `null` for expected absences.
- Strict TypeScript; no `any`; named exports preferred.
- Match existing patterns; no over-abstraction.

---

## Mandatory focused tests

Crypto, vault, signing, worker lock/unlock, and persistence-affecting changes **must** include or update Vitest coverage in `@hd-wallet/core`.

- Run: `pnpm --filter @hd-wallet/core test`
- Cover as applicable: KDF params, encrypt/decrypt round-trip, HD derivation vectors, worker lock/unlock, wrong-password paths, persistence mutations

See [`docs/CONTRIBUTING.md`](../../docs/CONTRIBUTING.md) and root validation rules.
