---
name: hd-wallet-security-review
description: >-
  Security review for HD Wallet changes touching core crypto, worker RPC, vault
  persistence, signing, clipboard, session stores, or dependencies. Use when
  reviewing diffs before merge, after security-sensitive edits, or when the user
  asks for a wallet security review.
disable-model-invocation: true
---

# HD Wallet security review

Review workflow for security-sensitive changes. Authority: [`AGENTS.md`](../../../AGENTS.md) §3, [`docs/SECURITY.md`](../../../docs/SECURITY.md), [`docs/THREAT_MODEL.md`](../../../docs/THREAT_MODEL.md), and rules [`security-invariants.mdc`](../../rules/security-invariants.mdc), [`core-and-worker.mdc`](../../rules/core-and-worker.mdc), [`stores-safety.mdc`](../../rules/stores-safety.mdc), [`web-ui-and-state.mdc`](../../rules/web-ui-and-state.mdc).

**Do not claim** that Web Worker isolation alone makes the SPA fully secure. Workers reduce main-thread exposure; they do not remove XSS, malicious extensions, RPC trust, or physical-access threats.

## Stop conditions

Stop and escalate to the user if the diff:

- Changes vault envelope format, KDF params, derivation paths, or worker API contracts without an approved high-risk plan
- Adds dependencies or modifies `pnpm-lock.yaml` without explicit approval
- Cannot be reviewed because the diff is missing or too large — request a focused file list

## Review checklist

### Worker boundary

- [ ] Passwords, mnemonics, seeds, keys, encryption keys, decrypted vault stay in the crypto worker
- [ ] Main thread and Zustand receive `PublicWalletState` / `VaultMetadata` only
- [ ] No new crypto logic in `apps/web` (belongs in `@hd-wallet/core`)

### Logging and errors

- [ ] No secrets in logs, error messages, URLs, analytics, or clipboard history
- [ ] User-facing errors do not leak ciphertext, keys, or mnemonic words

### Session and persistence

- [ ] No `FORBIDDEN_SESSION_KEYS` in session store or persisted Zustand (`password`, `mnemonic`, `privateKey`, `encryptionKey`, `rawSeed`, `decryptedVault`)
- [ ] `useSessionStore` is not persisted
- [ ] Vault/metadata changes use reconciled reads where routing depends on existence

### Signing and send UX

- [ ] Sign and broadcast go through `openSignConfirmDialog` — no silent signing
- [ ] Send flow preserved: build → preview → confirm → worker sign → optional broadcast
- [ ] Transaction preview matches what will be signed (amount, recipient, chain)

### Crypto and vault

- [ ] Envelope/payload changes follow [`docs/VAULT_FORMAT.md`](../../../docs/VAULT_FORMAT.md)
- [ ] Migration compatibility considered for persisted vaults
- [ ] Clipboard uses `copyWithClear` for addresses/secrets

### Tests and dependencies

- [ ] Crypto/vault/signing changes include focused Vitest in `@hd-wallet/core`
- [ ] Session/guard changes include web or stores tests when behavior changes
- [ ] Dependency and lockfile changes called out explicitly

## Severity output

```markdown
## Security review

### Critical (must fix)

- ...

### Warning (should fix)

- ...

### Notes

- ...

### Worker-boundary files

- ...

### Validation gaps

- ...
```

## Focused validation (when applicable)

| Change area                | Command                                |
| -------------------------- | -------------------------------------- |
| `packages/core`            | `pnpm --filter @hd-wallet/core test`   |
| `packages/stores`          | `pnpm --filter @hd-wallet/stores test` |
| `apps/web` signing/routing | `pnpm --filter @hd-wallet/web test`    |
| Types across packages      | `pnpm typecheck`                       |

Do not auto-commit, push, or run Playwright unless requested.
