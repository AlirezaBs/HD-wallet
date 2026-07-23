# Phase 9 — Browser Extension (Deferred)

This directory will contain the WXT browser extension when implemented.

## Planned Structure

```
apps/extension/
├── entrypoints/
│   ├── popup/          # Reuses apps/web UI components
│   └── background.ts   # Auto-lock timer, future dApp bridge
├── wxt.config.ts
└── package.json
```

## Requirements

- Reuse `@hd-wallet/core` and shared UI from `apps/web`
- Popup shell ~360×600
- Background service worker for auto-lock
- No dApp injection in initial extension phase

See [ROADMAP.md](../../docs/ROADMAP.md) for timeline.
