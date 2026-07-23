# Documentation — Agent Rules

This file supplements the repository-root [`AGENTS.md`](../AGENTS.md). Root authority, security, scope, validation, and reporting rules remain in effect.

---

## When to update docs

Update docs only when behavior, architecture, security guarantees, public APIs, schemas, setup, or project status **actually changed**. Do not update docs merely because a code file was touched.

| Change type          | Required doc update                                                          |
| -------------------- | ---------------------------------------------------------------------------- |
| Vault schema change  | [`VAULT_FORMAT.md`](VAULT_FORMAT.md); see versioning below                   |
| New security surface | [`SECURITY.md`](SECURITY.md), [`THREAT_MODEL.md`](THREAT_MODEL.md)           |
| Architecture change  | [`ARCHITECTURE.md`](ARCHITECTURE.md)                                         |
| Feature status       | [`ROADMAP.md`](ROADMAP.md) — mark complete **only** with explicit permission |

Keep changes scoped; no whole-document rewrites when a section update suffices.

---

## Vault envelope vs payload

[`VAULT_FORMAT.md`](VAULT_FORMAT.md) is authoritative.

- **Envelope `version`:** encryption envelope (KDF/cipher/ciphertext layout).
- **Additive decrypted-payload fields** with safe defaults for missing values do **not** require an envelope version bump.
- **Breaking** payload changes, incompatible field-type changes, removed fields, changed field semantics, or encryption-envelope changes require a documented migration and an appropriate version bump.

When editing agent rules (`AGENTS.md`, nested `AGENTS.md`, `.cursor/rules`), keep them consistent with this model and with root security invariants.

---

## ROADMAP

- Do not mark roadmap items complete without explicit permission.
- Keep status aligned with implemented behavior — do not claim features that are not shipped.

---

## Style

- Prefer clear, accurate updates over broad rewrites.
- Do not weaken security or architecture guarantees in prose.
- Link to code or other docs instead of duplicating large specifications.
