# HD Wallet — Agent Instructions

Strict control document for AI agents working in this repository.

**Purpose:** Define what agents may change, when, and how they report results. This is not a convention guide — it is an operating contract.

**Authority split:**

- **Agent:** edits local files only when explicitly authorized; runs focused validation when the environment permits; reports commands and results honestly.
- **User:** final review, approval, commit, push, and submission. Agent validation does not replace user validation.

**Deep detail:** See [`docs/`](docs/) — do not duplicate those documents here.

**Layered rules:** Package-specific detail lives in nested `AGENTS.md` files. Cursor-specific reinforcement lives in [`.cursor/rules/`](.cursor/rules/). Nested and Cursor rules may strengthen but never weaken this root contract.

---

## 1. Project Identity

**What this is:** Browser-based BIP39 HD wallet for EVM and Solana chains.

**Monorepo layout:**

| Path              | Package             | Role                                                           |
| ----------------- | ------------------- | -------------------------------------------------------------- |
| `packages/core`   | `@hd-wallet/core`   | Crypto, vault, HD derivation, chain adapters — zero React deps |
| `packages/stores` | `@hd-wallet/stores` | Zustand public/session state only                              |
| `apps/web`        | `@hd-wallet/web`    | Vite React SPA (v1 product)                                    |
| `apps/extension`  | —                   | Placeholder only (Phase 9+); no code yet                       |

**Commands:**

```bash
pnpm install    # setup
pnpm dev        # development
pnpm test       # unit tests (core)
pnpm typecheck  # TypeScript
pnpm build      # production build
```

**Documentation:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/SECURITY.md`](docs/SECURITY.md) · [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md) · [`docs/VAULT_FORMAT.md`](docs/VAULT_FORMAT.md) · [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) · [`docs/ROADMAP.md`](docs/ROADMAP.md)

**Nested agent rules:** [`packages/core/AGENTS.md`](packages/core/AGENTS.md) · [`packages/stores/AGENTS.md`](packages/stores/AGENTS.md) · [`apps/web/AGENTS.md`](apps/web/AGENTS.md) · [`docs/AGENTS.md`](docs/AGENTS.md)

---

## 2. Agent Operating Protocol

### 2.1 Authority, submission, and validation

**DO NOT:**

- Create commits, push branches, open/merge PRs, or submit changes
- Edit local files unless explicitly asked to implement
- Claim a command passed unless it was executed successfully
- Treat agent validation as final approval

**DO:**

- Edit local files only on explicit implementation instruction
- Run relevant **focused validation** when the environment permits
- Report **exact commands executed** and **exact results**
- Show diff and validation results before describing work as complete

**User retains:** final review, approval, commit, push, submission.

**If validation cannot run:** explain why; provide exact commands for the user to run manually. Never skip reporting silently.

### 2.2 Planning vs implementation

**Planning mode is read-only** for investigation, review, explanation, or planning — unless the user explicitly authorizes implementation.

**DO NOT in planning mode:** edit files, run destructive commands, install packages, begin implementation.

**DO:** return a concrete plan; wait for explicit instruction (`implement`, `apply`, `fix`, `make the changes`).

**Authorization:** approval of a plan plus an affirmative response to proceed (e.g. "go ahead", "yes", "implement the plan") counts as authorization for **that plan's scope only**.

**Approved scope only:**

- An implementation instruction authorizes **only the agreed task scope**
- "Implement the plan" / "apply the changes" authorizes **only** files, behavior, and phases in the **latest approved plan**
- Does **not** authorize optional improvements, unrelated cleanup, refactors, dependency changes, or later phases
- If implementation reveals approved scope is insufficient: **stop and explain** before expanding

### 2.3 Task classification

| Category      | Examples                                                                                                                           | Requirements                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Trivial**   | Typo, copy change, small isolated style fix                                                                                        | Brief pre-edit analysis; name target file; implement only when requested; focused validation if relevant         |
| **Standard**  | Localized bug fix or feature in one package                                                                                        | List affected files; explain changes; stay in approved scope; final report + validation                          |
| **High-risk** | Security, crypto, persistence, public APIs, package boundaries, dependencies, config, migrations, worker contracts, large rewrites | Planning mandatory; security/risk impact explained; explicit implementation authorization; checkpoints or phases |

**High-risk trigger:** any announced file under `packages/core`, `apps/web/src/workers/`, or `packages/stores/src/session-store.ts`.

### 2.4 Pre-edit analysis

Before changing code (brief for trivial tasks):

1. Restate exact requested outcome
2. Inspect relevant existing implementation
3. Identify smallest set of files that must change
4. **List those files before editing**
5. Explain intended change in each file
6. Mention risks, assumptions, behavior changes
7. Stop if broader architecture work is required than requested

### 2.5 Scope, behavior, and change limits

**DO:**

- Smallest reasonable diff
- Only files required for approved outcome
- Preserve architecture, naming, behavior, UI, public APIs unless explicitly requested
- Report unrelated issues as observations — do not fix without permission

**DO NOT (without explicit permission):**

- Unrelated cleanup, refactoring, style rewrites, or "while you are here" improvements
- Unrelated comment, formatting, or import-order changes
- Rename/move files or directories; reorganize folders
- Rewrite entire file when localized edit suffices
- Project-wide formatters (write mode) or repo-wide search-and-replace
- Modify generated files, build output, snapshots, migrations
- Add/remove/upgrade/downgrade dependencies
- Change env var names, package exports, public APIs
- Change vault formats, worker contracts, persisted schemas, storage keys, routes, derivation paths
- Delete "unused" code without proving unused + approval
- Add compatibility fallbacks, migrations, or legacy behavior

**Preserve existing behavior** unless explicitly requested: UI copy, styling, layout, error messages, loading states, routes, defaults, serialization, network requests. Bug fixes preserve unrelated behavior. Do not change test expectations merely to make tests pass.

**Configuration:**

- No unrelated configuration changes
- Minimal config change allowed **only** when directly required for approved task
- Config file must be listed in pre-edit analysis with one-sentence reason and impact
- Project-wide modernization/cleanup not authorized
- Dependency, build, lint, test, TS, Vite, workspace, CI config changes require **escalation** when they may affect unrelated code

**Lockfiles:**

- Do not modify lockfiles unless explicitly approved dependency operation requires it
- Lockfile changes must be direct result of that approved operation
- Do not run install commands merely to refresh/normalize lockfile
- Report all dependency and lockfile changes in scope check

**User changes take priority:**

- Assume uncommitted changes belong to the user
- Never revert, overwrite, reformat, or discard changes not created for current task
- If target file has unexpected edits: preserve and report conflict
- No `git reset`, `git checkout --`, `git restore`, `git clean`, force checkout without explicit instruction

### 2.6 Escalation

**File count is a scope warning, not an automatic blocker.**

A cohesive change may touch >5 files if all serve one approved purpose, stay within expected package boundaries, and are listed before editing.

**Mandatory escalation** — stop and explain before implementing when change affects:

- Security boundaries
- Persisted data
- Public APIs
- Package boundaries
- Dependencies
- Configuration (when may affect unrelated code)
- Worker contracts
- Vault formats
- Derivation paths
- Requires broad rewrite
- Original request based on incorrect architectural assumption

Propose smaller phases. Evaluate semantic size and risk, not line count alone.

### 2.7 Assumptions and instruction priority

**No fabricated assumptions:**

- Inspect repository before referring to files, functions, commands, deps, architecture
- Never invent paths, APIs, components, hooks, commands, tests, config
- Label unconfirmed items as assumptions
- Prefer existing patterns; least invasive option when multiple approaches exist

**Uncertainty:** make safe, reversible, clearly stated assumptions for minor uncertainty. Stop only when uncertainty affects security, architecture, persisted data, public APIs, dependencies, or task scope.

**Instruction priority:**

1. **Non-negotiable security baseline** (Section 3)
2. **User's current explicit request and approved scope**
3. **Agent Operating Protocol** (this section)
4. **Nearest applicable nested `AGENTS.md`** (and Package rules index)
5. **Existing project documentation** (`docs/`)
6. **Existing local code patterns**
7. **General ecosystem best practices**

Cursor `.cursor/rules/*.mdc` reinforce the above; they must never weaken root security or expand approved scope.

**Security override rule:**

- User instructions control intended behavior and scope but **do not override** non-negotiable security invariants
- If request conflicts with security invariant: **do not implement silently** — explain conflict and propose secure alternative
- On any priority conflict: stop and explain

### 2.8 Dependencies

- Reuse existing dependencies when reasonably possible
- Do not install packages for functionality achievable with existing deps or platform APIs
- Before proposing new dependency: why needed, why existing insufficient, bundle/security/maintenance impact, alternatives
- Installing/modifying dependencies requires explicit approval

### 2.9 Validation and testing

**Validation responsibility:**

- Agent runs relevant focused validation when environment permits
- Report exact commands and exact results
- Never claim success without actual execution
- Agent validation does **not** replace user's final review
- If validation cannot run: explain why; provide manual commands

**Testing policy:**

- Tests validate behavior, not implementation details
- Add/update tests when behavior changes; prefer focused tests
- Never weaken, skip, delete, or broadly rewrite tests only to pass
- Never update snapshots unless changed output is intentional and explained
- Run focused validation for affected package/feature first; broader commands only when relevant
- Distinguish failures caused by current change vs pre-existing

**Unrelated errors:**

- Do not fix unrelated repo-wide type, lint, build, or test errors
- May fix error in a file already being changed **only when** current implementation caused it or error directly blocks approved task
- Report pre-existing failures separately; do not expand into general cleanup

### 2.10 Security-sensitive changes

Applies to: cryptography, seeds, keys, passwords, signing, tx construction, worker boundaries, persistence, clipboard, RPC, wallet locking.

**DO:**

1. Treat [`docs/SECURITY.md`](docs/SECURITY.md) and related docs as authoritative
2. Explain security impact before editing
3. Preserve secret isolation boundaries
4. Add/update focused tests
5. In final report: identify every security-sensitive file changed; explain security-relevant behavior changed in each; show relevant diff when available; if full diff too large, show critical sections and state what was omitted
6. Never hide security-sensitive change inside general summary

**DO NOT:**

- Silently introduce fallback behavior
- Log secrets or secret-derived material
- Reduce KDF, encryption, confirmation, or validation requirements for convenience

Section 3 defines **what** is forbidden. This subsection defines **how** to handle security edits.

### 2.11 Documentation

- Do not update docs merely because code was touched
- Update only when behavior, architecture, security guarantees, public APIs, schemas, setup, or project status actually changed
- Keep changes scoped; no whole-document rewrites when a section update suffices
- Do not mark roadmap items complete without explicit permission
- See [`docs/AGENTS.md`](docs/AGENTS.md) for documentation process detail

### 2.12 Prohibited actions

**Never:**

- Commit, push, open/merge PRs; modify Git history; use destructive Git commands
- Reset or discard user changes
- Edit secrets or real environment files; read or print secret values
- Disable security checks
- Use `any`, unsafe casts, `@ts-ignore`, `@ts-expect-error`, or empty catch blocks as shortcuts
- Comment out failing code/tests instead of fixing requested issue
- Leave temporary logs, debug code, mock credentials, TODO placeholders, dead code
- Claim completion without inspecting resulting diff

**TypeScript suppression (when genuinely necessary for third-party gaps):**

- Narrowest possible scope
- Concise justification inline
- Prefer `@ts-expect-error` over `@ts-ignore`
- Add test where appropriate
- Report explicitly in final implementation report
- Security-sensitive code: no type suppression without explicit approval

### 2.13 Phased implementation

For medium/large or high-risk tasks: split into reviewable phases.

**End of each phase:** show files changed, summarize diff, run focused validation.

**Do not continue automatically:**

- Completing one phase does not authorize the next
- Optional follow-up must not begin automatically
- Stop after approved phase, report results, wait for new implementation instruction

### 2.14 Comments

- No comments that merely restate obvious code
- Comments only for security decisions, non-obvious invariants, protocol constraints, important reasoning
- No verbose AI-style documentation in source files
- Match existing project tone

### 2.15 Final implementation report

Required after any implementation. Include:

1. **Summary** — what changed
2. **Changed files** — exact list + reason each changed
3. **Behavior** — added, changed, preserved
4. **Security considerations** — per Section 2.10 if applicable
5. **Validation** — commands executed, exact results; note if not fully executed
6. **Limitations** — unresolved concerns
7. **Observations** — unrelated issues discovered but not changed
8. **Scope check block** — see Section 7
9. **Manual review** — only when relevant; **omit section entirely if not needed**

Use the template in Section 7.

### 2.16 Commit message format

When the user explicitly requests a commit, use this format:

```
[TYPE] Short imperative summary

Optional body explaining why, not just what.
```

**Required prefix:** uppercase type tag in square brackets, one space, then the subject line.

**Standard types:**

| Type         | Use for                                                  |
| ------------ | -------------------------------------------------------- |
| `[FEAT]`     | New feature or user-visible capability                   |
| `[FIX]`      | Bug fix                                                  |
| `[DOCS]`     | Documentation only                                       |
| `[REFACTOR]` | Code change that neither fixes a bug nor adds a feature  |
| `[TEST]`     | Adding or updating tests                                 |
| `[CHORE]`    | Build, tooling, deps, config — no production code change |
| `[SECURITY]` | Security-relevant fix or hardening                       |

Pick the closest type. Prefer `[FEAT]` and `[FIX]` for product changes; use the others when they fit better.

**Examples:**

```
[FEAT] Add address book to Send flow

[FIX] Prevent auto-lock from firing during sign confirm

[DOCS] Document vault export format in VAULT_FORMAT.md
```

**Rules:**

- Subject: imperative mood, concise, no trailing period
- One logical change per commit when possible
- Do not commit unless the user explicitly asks

---

## 3. Non-negotiable security baseline

These rules apply to every agent and cannot be weakened by scoped instructions. See [`docs/SECURITY.md`](docs/SECURITY.md) and [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md).

**Never on main thread or in Zustand:**

- password, mnemonic, private keys, encryption key, raw seed, decrypted vault

Enforced via `FORBIDDEN_SESSION_KEYS` in `packages/stores/src/session-store.ts`.

**Required:**

- All crypto/signing via Web Worker + Comlink only
- React receives `PublicWalletState` only (addresses/paths — no secrets)
- Routing uses `VaultMetadata` without decryption
- Signing/broadcast via `openSignConfirmDialog` — never silent
- Clipboard copies via `copyWithClear` (30-second auto-clear)
- `lockVault()` on auto-lock; signing fails when locked

**Forbidden:**

- Secrets in React state, context, URL params, localStorage, logs, clipboard history, analytics, or error reports
- `dangerouslySetInnerHTML`, eval
- Crypto logic in `apps/web` (belongs in `@hd-wallet/core`)
- React/Zustand dependencies in `@hd-wallet/core`
- Persisting session store (must stay in-memory)

**Do not change without an approved high-risk plan and focused tests:** vault formats, cryptographic parameters, derivation paths, worker contracts, persistence behavior, or security boundaries.

Follow [`docs/SECURITY.md`](docs/SECURITY.md) and the nearest applicable `AGENTS.md`.

Cursor-specific reinforcement (optional for non-Cursor agents): [`.cursor/rules/security-invariants.mdc`](.cursor/rules/security-invariants.mdc)

---

## 4. Package rules index

If your agent does not auto-load nested `AGENTS.md` files, treat this index as mandatory when editing those trees. Prefer reading the linked nested file when available.

### packages/core — [`AGENTS.md`](packages/core/AGENTS.md)

Highest-risk: no React/Zustand/DOM in core; crypto/vault/signing only via worker APIs; do not change vault formats, derivation paths, or worker contracts without an approved high-risk plan; mandatory focused Vitest for crypto/vault/signing/persistence changes.

### packages/stores — [`AGENTS.md`](packages/stores/AGENTS.md)

Highest-risk: public/session state only; never store secrets (`FORBIDDEN_SESSION_KEYS`); session store must not persist; no decrypted vault or key material.

### apps/web — [`AGENTS.md`](apps/web/AGENTS.md)

Highest-risk: no secrets or key handling on the main thread; signing/broadcast only via explicit confirmation (`openSignConfirmDialog`); preserve send flow and UI/routing conventions; reuse existing shadcn primitives.

### docs — [`AGENTS.md`](docs/AGENTS.md)

Highest-risk: update docs only when behavior/architecture/security/format warrants it; vault envelope vs additive payload versioning per `VAULT_FORMAT.md`; do not mark ROADMAP items complete without permission; no broad rewrites.

---

## 5. Rule discovery

Before editing a file:

1. Read root `AGENTS.md`.
2. Read the nearest applicable nested `AGENTS.md` (or at minimum the Package rules index entry above).
3. In Cursor, also follow matching `.cursor/rules/*.mdc`.
4. Read referenced docs for security, architecture, vault format, or roadmap changes.

Scoped rules may strengthen but never weaken root rules.

---

## 6. Out of Scope — Do Not Generate

Stop and ask rather than invent code for:

- Browser extension (`apps/extension` — WXT, Phase 9+)
- WalletConnect / EIP-1193 provider injection
- Hardware wallet support
- SPL token sends
- NFT gallery
- New state management library (stick to Zustand)
- Backend/server (client-only wallet)
- Replacing crypto libs (`@scure/*`, `@noble/*`, hash-wasm) without explicit request

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for planned features.

---

## 7. Pre-Submit Checklist

Agent runs this before claiming work is ready for user review.

### Scope control

- [ ] Requested task completed — no unrelated work
- [ ] Stayed within approved scope
- [ ] Unrelated refactors: **no**
- [ ] Files changed only from announced list (or explained deviation)
- [ ] User's uncommitted changes preserved
- [ ] No prohibited actions (commits, pushes, PRs, destructive git, secret logging, debug leftovers)
- [ ] Phased work stopped after approved phase (if applicable)

### Technical correctness

- [ ] No secrets in React state, Zustand, localStorage, or URL
- [ ] Crypto/signing in worker; confirmation dialog preserved
- [ ] Package boundaries respected
- [ ] Focused tests added/updated for behavior changes
- [ ] Validation run when possible; commands and results reported honestly
- [ ] Docs updated only where behavior/architecture/security actually changed
- [ ] Diff inspected and shown to user

### Risk flags (must explain any "yes")

- [ ] Approved scope exceeded
- [ ] Dependencies changed
- [ ] Lockfile changed
- [ ] Configuration changed
- [ ] Public APIs changed
- [ ] Persisted formats changed
- [ ] Worker contracts changed
- [ ] Security boundaries changed
- [ ] TypeScript suppressions added

### Implementation report template

```markdown
## Summary

[What changed and why]

## Changed files

| File | Reason |
| ---- | ------ |
| ...  | ...    |

## Behavior

- Added: ...
- Changed: ...
- Preserved: ...

## Security considerations

[Only if applicable — per-file security-relevant behavior; critical diff sections]

## Validation

| Command | Result            |
| ------- | ----------------- |
| ...     | pass/fail/not-run |

[If not fully executed: why + manual commands for user]

## Limitations

[Unresolved concerns]

## Observations (not changed)

[Unrelated issues discovered]

## Scope check

- Requested task completed: yes/no
- Approved scope exceeded: yes/no — [explanation if yes]
- Unrelated refactors performed: yes/no — [explanation if yes]
- Files changed outside the announced list: yes/no — [explanation if yes]
- Dependencies changed: yes/no — [explanation if yes]
- Lockfile changed: yes/no — [explanation if yes]
- Configuration changed: yes/no — [explanation if yes]
- Public APIs changed: yes/no — [explanation if yes]
- Persisted formats changed: yes/no — [explanation if yes]
- Worker contracts changed: yes/no — [explanation if yes]
- Security boundaries changed: yes/no — [explanation if yes]
- User changes preserved: yes/no — [explanation if yes]
- Validation fully executed: yes/no — [explanation if yes]

## Manual review

[Include ONLY when relevant — omit section entirely if not needed]

- Files to inspect: ...
- Security-sensitive lines: ...
- UI flow to test: ...
- Expected behavior: ...
- Edge cases not covered: ...
- Commands to rerun: ...
```
