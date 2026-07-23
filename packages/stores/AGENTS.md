# @hd-wallet/stores — Agent Rules

This file supplements the repository-root [`AGENTS.md`](../../AGENTS.md). Root authority, security, scope, validation, and reporting rules remain in effect.

---

## Public-state only

Zustand stores hold **public and session UI state only** — never secrets or decrypted vault material.

**Forbidden fields** (enforced via `FORBIDDEN_SESSION_KEYS` in `session-store.ts`):

- `password`
- `mnemonic`
- `privateKey`
- `encryptionKey`
- `rawSeed`
- `decryptedVault`

Do not add secret-derived fields under any other name.

---

## Persistence

| Store              | Persisted?                                                         |
| ------------------ | ------------------------------------------------------------------ |
| `useSessionStore`  | **No** — must stay in-memory                                       |
| `useNetworkStore`  | Yes (localStorage) — network mode only                             |
| `useSettingsStore` | Yes (localStorage) — theme, auto-lock minutes, non-secret settings |
| `useUiStore`       | No — dialogs/selectors                                             |

Never persist the session store. Never put secrets in localStorage.

---

## Conventions

- Store hooks: `useXxxStore`
- Match existing store patterns and selectors
- Keep stores free of React component imports and crypto logic
