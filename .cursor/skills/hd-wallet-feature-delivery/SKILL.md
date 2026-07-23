---
name: hd-wallet-feature-delivery
description: >-
  Delivers a scoped HD Wallet feature safely across the monorepo with explicit
  scope, security boundaries, focused tests, and validation evidence. Use when
  implementing or extending wallet product features in apps/web, stores, or
  core.
disable-model-invocation: true
---

# HD Wallet feature delivery

End-to-end workflow for scoped feature work. Follow root [`AGENTS.md`](../../../AGENTS.md); read nearest nested `AGENTS.md` and matching [`.cursor/rules/`](../../rules/) before editing.

## Stop conditions

Stop and ask the user if:

- The feature is listed as out-of-scope in [`out-of-scope.mdc`](../../rules/out-of-scope.mdc) (extension, WalletConnect, hardware wallet, backend, etc.)
- The change requires vault format, worker contract, derivation path, or dependency changes without an approved plan
- Requirements are ambiguous — clarify scope and non-goals first

## Workflow

### 1. Read rules and docs

- Root `AGENTS.md` + nearest package `AGENTS.md` (`packages/core`, `packages/stores`, `apps/web`)
- Relevant `.cursor/rules/*.mdc` for touched trees

### 2. Inspect existing patterns

- Find similar features under `apps/web/src/features/` or `packages/core/src/chains/`
- Reuse shadcn primitives, worker client, React Query vs Zustand split per [`web-ui-and-state.mdc`](../../rules/web-ui-and-state.mdc)

### 3. Define scope

Write briefly:

- **In scope:** user-visible outcome and files expected
- **Non-goals:** what this task will not change

### 4. Map packages and boundaries

| Package             | Typical role                       |
| ------------------- | ---------------------------------- |
| `@hd-wallet/core`   | Crypto, vault, chains — no React   |
| `@hd-wallet/stores` | Public session/settings state only |
| `@hd-wallet/web`    | UI, worker entry, routing          |

Flag high-risk paths: `packages/core`, `apps/web/src/workers/`, `session-store.ts`.

### 5. Small implementation plan

List files to change and why. Wait for explicit user approval before implementing if the task is high-risk or was planning-only.

### 6. Tests

- Add or update focused Vitest for behavior changes
- Prefer package-local tests over broad rewrites
- Never delete or weaken tests only to pass

### 7. Implement

- Smallest reasonable diff; no unrelated refactors
- Preserve signing confirmation, worker boundary, and routing conventions

### 8. Focused validation

| Touched package   | Command                                |
| ----------------- | -------------------------------------- |
| `packages/core`   | `pnpm --filter @hd-wallet/core test`   |
| `packages/stores` | `pnpm --filter @hd-wallet/stores test` |
| `apps/web`        | `pnpm --filter @hd-wallet/web test`    |

### 9. Cross-package checks (when needed)

If types or imports span packages:

```bash
pnpm typecheck
pnpm build
```

Do not run full `pnpm test` or Playwright unless scope requires it or the user asks.

### 10. Diff review

Inspect the final diff. For security-sensitive areas, invoke `hd-wallet-security-review` or follow its checklist.

### 11. Report

Use the root `AGENTS.md` implementation report template (Summary, Changed files, Behavior, Security, Validation, Scope check). Report **exact commands and results**. Do not commit or push unless asked.

## Non-goals (always)

- Auto-commit or auto-push
- `pnpm install` without explicit approval
- Real mnemonics, keys, or mainnet transactions in tests
- Optional cleanup outside approved scope
