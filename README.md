# HD Wallet

[![CI](https://github.com/AlirezaBs/HD-wallet/actions/workflows/ci.yml/badge.svg)](https://github.com/AlirezaBs/HD-wallet/actions/workflows/ci.yml)

Open-source hierarchical deterministic wallet supporting EVM and Solana.

## Features

- BIP39/BIP44 HD wallet with encrypted vault (Argon2id + AES-256-GCM)
- EVM (Ethereum/Sepolia) and Solana (mainnet/devnet) support
- Web Worker crypto boundary — secrets never touch React state
- Message signing and transaction signing with explicit confirmation
- MetaMask-inspired UI with original branding
- Dark blue theme with light/dark mode

## Quick Start

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173

## Documentation

| Topic        | Source                                       |
| ------------ | -------------------------------------------- |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Security     | [docs/SECURITY.md](docs/SECURITY.md)         |
| Threat model | [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) |
| Vault format | [docs/VAULT_FORMAT.md](docs/VAULT_FORMAT.md) |
| Roadmap      | [docs/ROADMAP.md](docs/ROADMAP.md)           |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security issues: [SECURITY.md](SECURITY.md).

## Tech Stack

- React 19 + Vite + TypeScript
- Zustand (public state only)
- shadcn/ui + Tailwind CSS v4
- viem (EVM), @solana/web3.js (Solana)
- Comlink Web Workers

## License

MIT — see [LICENSE](LICENSE).
