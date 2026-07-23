# HD Wallet

Open-source hierarchical deterministic wallet supporting EVM and Solana chains.

## Features

- BIP39/BIP44 HD wallet with encrypted vault (Argon2id + AES-256-GCM)
- EVM (Ethereum/Sepolia) and Solana (mainnet/devnet) support
- Web Worker crypto boundary — secrets never touch React state
- Message signing and transaction signing with explicit confirmation
- Native ETH/SOL and ERC-20 send flows
- Unified token portfolio with detail pages and price charts
- Dark/light theme and auto-lock idle timer

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173

For prerequisites, project layout, and development workflow, see [Quick start](getting-started.md).

## Documentation map

| Topic           | Page                            |
| --------------- | ------------------------------- |
| System design   | [Architecture](ARCHITECTURE.md) |
| Vault schema    | [Vault format](VAULT_FORMAT.md) |
| Security rules  | [Security](SECURITY.md)         |
| Threat analysis | [Threat model](THREAT_MODEL.md) |
| Feature status  | [Roadmap](ROADMAP.md)           |
| Contributing    | [Contributing](CONTRIBUTING.md) |

## Tech stack

- React 19 + Vite + TypeScript
- Zustand (public state only)
- shadcn/ui + Tailwind CSS v4
- viem (EVM), @solana/web3.js (Solana)
- Comlink Web Workers

## License

MIT — see [LICENSE](../LICENSE) in the repository root.
