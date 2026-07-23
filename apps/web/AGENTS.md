# @hd-wallet/web — Agent Rules

This file supplements the repository-root [`AGENTS.md`](../../AGENTS.md). Root authority, security, scope, validation, and reporting rules remain in effect.

---

## Main-thread security

- **No** secrets, mnemonics, private keys, seeds, encryption keys, or decrypted vault on the main thread.
- Crypto/signing only via Web Worker + Comlink (worker entry may live under `apps/web/src/workers/`; implementation belongs in `@hd-wallet/core`).
- React receives `PublicWalletState` only (addresses/paths).
- Routing uses `VaultMetadata` without decryption.

---

## UI and components

- **Layout:** max-width ~480px centered column (extension-like); bottom nav: Home | Send | Activity | Settings; EVM | Solana chain tabs
- **Components:** shadcn-style primitives in `components/ui/` with `cn()` helper — reuse before inventing new ones
- **Structure:** pages under `routes/`; cross-cutting features under `features/`
- **Theme:** dark/light/system via CSS variables in `apps/web/src/index.css`
- **Do not** introduce a new UI library or CSS framework

**Naming:**

- kebab-case for UI primitives (`password-input.tsx`)
- PascalCase for pages (`HomePage.tsx`)
- `useXxx` hooks; `useXxxStore` for Zustand

**Imports:** `@/` path alias, no `.js` suffix.

**Style:** match the file being edited; smallest reasonable diff; no drive-by refactors or over-abstraction.

---

## Routing (preserve)

- `/` → `AppRouter` checks vault metadata + session → onboarding / unlock / wallet
- `WalletGuard` protects `/wallet/*`
- `useAutoLock` locks worker and redirects to `/unlock`

---

## State: Zustand vs React Query

| Concern                        | Tool                 | Persisted?         |
| ------------------------------ | -------------------- | ------------------ |
| Unlock state, active accounts  | `useSessionStore`    | No (in-memory)     |
| Network mode (mainnet/testnet) | `useNetworkStore`    | Yes (localStorage) |
| Theme, auto-lock minutes       | `useSettingsStore`   | Yes (localStorage) |
| Dialogs, selectors             | `useUiStore`         | No                 |
| RPC data, token prices         | TanStack React Query | Cache only         |

Do not put secrets in any store. Do not invent a new state library.

---

## Signing and broadcast UX (must preserve)

1. Main thread builds unsigned tx
2. Preview UI shows details
3. User confirms via `openSignConfirmDialog`
4. Worker signs
5. Optional broadcast (EVM and Solana native SOL)

Do not shortcut this flow. Never silent signing.

Clipboard copies via `copyWithClear` (30-second auto-clear).

---

## Accessibility

- Prefer existing accessible primitives (`Button`, `Label`, form controls with labels)
- Interactive controls must be keyboard-reachable and have accessible names
- Do not invent a large new a11y framework; match existing patterns

---

## E2E

Playwright exists but is not in CI — add or expand E2E only when explicitly requested.
