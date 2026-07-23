---
name: hd-wallet-onboarding-debug
description: >-
  Diagnoses HD Wallet onboarding, reset, unlock, backup, and vault-exists
  routing bugs by separating persisted vault state from in-memory session state.
  Use when users are stuck on unlock/onboarding, see Vault already exists, lose
  backup flow, or after reset wallet behaves incorrectly.
disable-model-invocation: true
---

# HD Wallet onboarding debug

Workflow for routing and vault-lifecycle bugs. Follow root [`AGENTS.md`](../../../AGENTS.md) and scoped rules — especially [`onboarding-vault-routing.mdc`](../../rules/onboarding-vault-routing.mdc), [`security-invariants.mdc`](../../rules/security-invariants.mdc), [`core-and-worker.mdc`](../../rules/core-and-worker.mdc).

## Stop conditions

Stop and ask the user if:

- You cannot reproduce or observe the reported route/screen
- Dev server is not running and browser reproduction is required
- The report involves real mainnet funds or a production mnemonic

## Security while debugging

- Never log, print, or paste mnemonics, passwords, private keys, or decrypted vault payloads
- Inspect IndexedDB **keys and metadata only** — not ciphertext decryption on the main thread
- Use test mnemonics from Vitest fixtures only when writing tests

## Step 1 — Reproduce before editing

1. Note the URL path (e.g. `/onboarding`, `/unlock`, `/onboarding/backup`, `/wallet`)
2. Reproduce with `pnpm dev` and browser navigation; use cursor-ide-browser only if helpful
3. Record exact user-visible error text (e.g. "Vault already exists", wrong password, unexpected redirect)

## Step 2 — Collect state (persisted vs session)

Build a divergence table. **Do not merge these columns.**

| Signal                  | Source                                             | What to check                                       |
| ----------------------- | -------------------------------------------------- | --------------------------------------------------- |
| Reconciled vault exists | `getVaultMetadata()` / `hasVault()` via core       | `hasVault` after metadata/ciphertext reconciliation |
| Raw metadata            | IndexedDB `hd-wallet` → `vault` → `metadata`       | `hasVault` flag only                                |
| Ciphertext present      | IndexedDB → `encrypted-vault` key                  | presence only, not payload                          |
| Session unlocked        | `useSessionStore`                                  | `isUnlocked`, `publicWalletState` non-null          |
| Worker locked           | worker `lockVault` / unlock failure                | signing/unlock errors when locked                   |
| Router state            | `location.state` on backup route                   | mnemonic handoff present or lost                    |
| Guard outcome           | `useVaultAccess`, `OnboardingGuard`, `WalletGuard` | expected vs actual redirect                         |

**Key files:** `useVaultAccess.ts`, `OnboardingGuard.tsx`, `WalletGuard.tsx`, `AppRouter.tsx`, `wallet-session.ts`, onboarding/unlock route pages, `packages/core/src/vault/metadata.ts`.

## Step 3 — Find first divergence

Walk this order until state and routing disagree:

```text
IDB metadata/ciphertext → getVaultMetadata() → hasVault()
  → session isUnlocked/publicWalletState
  → current pathname + guards
  → user-visible screen
```

Common failure patterns:

- Vault created but backup lost `location.state` → generic onboarding while `hasVault: true`
- Stale routing cache vs fresh IDB after reset/import
- `loadVaultMetadata()` used for routing instead of reconciled `getVaultMetadata()`
- Reset cleared vault but user remains on `/unlock`

Identify the **first** step where expected and actual diverge. That is the fix target.

## Step 4 — Fix and regression test

1. Smallest diff in approved scope only
2. Add or update a focused test **before or with** the fix:
   - Core vault/metadata: `pnpm --filter @hd-wallet/core test`
   - Web routing/helpers: `pnpm --filter @hd-wallet/web test`
3. Do not run Playwright unless explicitly requested

## Step 5 — Validate

| Area touched                        | Command                              |
| ----------------------------------- | ------------------------------------ |
| `packages/core` vault/routing reads | `pnpm --filter @hd-wallet/core test` |
| `apps/web` guards/routes            | `pnpm --filter @hd-wallet/web test`  |
| Cross-package types                 | `pnpm typecheck`                     |

Report exact commands and results. Do not commit or push unless the user asks.

## Report template

```markdown
## Reproduction

- Route:
- Steps:

## State table

| Signal | Expected | Actual |

## First divergence

- Step:
- Cause hypothesis:

## Fix

- Files:
- Test added/updated:

## Validation

| Command | Result |
```
