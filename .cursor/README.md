# Cursor configuration

Project-local Cursor rules, skills, and hooks for HD Wallet. Authoritative contracts remain in root [`AGENTS.md`](../AGENTS.md) and nested package `AGENTS.md` files — `.cursor` content reinforces those contracts; it does not replace them.

## Layout

| Path                           | Purpose                                                                  |
| ------------------------------ | ------------------------------------------------------------------------ |
| [`rules/*.mdc`](rules/)        | Scoped agent constraints attached by file glob or `alwaysApply`          |
| [`skills/*/SKILL.md`](skills/) | Explicit-invocation workflows (debug, security review, feature delivery) |
| [`hooks.json`](hooks.json)     | Cursor hook event wiring                                                 |
| [`hooks/`](hooks/)             | Hook scripts (formatting, guards)                                        |

## Rules

- **Always apply:** `cursor-workflow`, `security-invariants`, `out-of-scope`, `large-task-git-workflow`
- **Scoped:** package/core, web UI, stores, docs, onboarding routing, package boundaries
- **Meta:** `create-rules.mdc` — format for new `.mdc` files

When adding a rule: one concern per file, under ~50 lines, reference `AGENTS.md` instead of copying it. See [`rules/create-rules.mdc`](rules/create-rules.mdc).

## Skills

Invoke by name in chat (e.g. “use `hd-wallet-onboarding-debug`”). Skills are workflows, not permanent constraints.

| Skill                         | Use when                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| `hd-wallet-onboarding-debug`  | Unlock/onboarding/reset/vault-exists routing bugs            |
| `hd-wallet-security-review`   | Reviewing crypto, worker, vault, signing, or session changes |
| `hd-wallet-feature-delivery`  | Scoped feature implementation across the monorepo            |
| `hd-wallet-dependency-review` | Before installing or upgrading npm/pnpm packages             |

## Hooks

- `afterFileEdit` → `hooks/format-after-edit.mjs` (Prettier on changed supported files only)
- `stop` → `hooks/typecheck-after-stop.mjs` (runs `pnpm typecheck` once after a task when TS/config files changed; not on every edit)

Do not add hooks that run the full test suite, Playwright, or `pnpm install` on every edit.

## Maintenance

- Ignore Cursor debug logs via `.gitignore` (`.cursor/*.log`, `.cursor/debug-*.log`)
- Commit `rules/`, `skills/`, `hooks.json`, and `hooks/` — not debug logs or local cache
- Fix contradictory examples in rules when APIs change; do not duplicate rule content across files
- New security policy belongs in `AGENTS.md` / `docs/SECURITY.md` first, then a short rule reference
