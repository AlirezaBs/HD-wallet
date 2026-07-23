# Contributing

## Development

```bash
pnpm install
pnpm dev
```

See [getting-started.md](getting-started.md) for prerequisites, monorepo layout, and common commands.

## Project Structure

- `packages/core` — crypto, vault, HD derivation, chain adapters
- `packages/stores` — Zustand public/session state
- `apps/web` — Vite React web app

## Security Guidelines

- Never pass secrets through Zustand
- All signing in Web Worker
- Add tests for crypto changes
- Update `docs/VAULT_FORMAT.md` if vault schema changes

## Pull Requests

1. Run `pnpm test`, `pnpm typecheck`, and `pnpm format:check`
2. Describe security implications if touching crypto
3. Keep PRs focused and reviewable

Root-level [CONTRIBUTING.md](../CONTRIBUTING.md) and [SECURITY.md](../SECURITY.md) mirror these guidelines for GitHub.
