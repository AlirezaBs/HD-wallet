# Quick start

## Prerequisites

- **Node.js 22** (see `.nvmrc` in the repository root)
- **pnpm 9** (see `packageManager` in root `package.json`)

## Install and run

```bash
git clone https://github.com/AlirezaBs/HD-wallet.git
cd HD-wallet
pnpm install
pnpm dev
```

Open http://localhost:5173 in your browser.

## Monorepo layout

| Path              | Package             | Role                                                           |
| ----------------- | ------------------- | -------------------------------------------------------------- |
| `packages/core`   | `@hd-wallet/core`   | Crypto, vault, HD derivation, chain adapters — zero React deps |
| `packages/stores` | `@hd-wallet/stores` | Zustand public/session state only                              |
| `apps/web`        | `@hd-wallet/web`    | Vite React SPA (v1 product)                                    |
| `apps/extension`  | —                   | Placeholder for a future browser extension                     |

## Common commands

```bash
pnpm dev          # Start all packages in dev mode
pnpm test         # Run unit tests (core + stores + web)
pnpm typecheck    # TypeScript check across the monorepo
pnpm build        # Production build
pnpm format:check # Verify Prettier formatting
```

## Package-specific development

```bash
pnpm --filter @hd-wallet/web dev      # Web app only
pnpm --filter @hd-wallet/core test    # Core crypto/vault tests
pnpm --filter @hd-wallet/stores test  # Session store tests
```

## Security note for contributors

Secrets (password, mnemonic, private keys) must never appear in React state, Zustand, localStorage, or URLs. All crypto and signing runs in a Web Worker. See [Security](SECURITY.md) before touching vault or worker code.

## Next steps

- Read [Architecture](ARCHITECTURE.md) for data flow and package boundaries
- Read [Contributing](CONTRIBUTING.md) for PR guidelines and security expectations
