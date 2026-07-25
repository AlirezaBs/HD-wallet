---
name: hd-wallet-dependency-review
description: >-
  Review proposed npm/pnpm dependency installs or upgrades before approval.
  Checks necessity, bundle impact, browser compatibility, security, and
  lockfile scope. Use when adding, upgrading, or removing packages.
disable-model-invocation: true
---

# HD Wallet dependency review

Evaluate **every** proposed dependency install or upgrade before changing `package.json` or the lockfile. Root [`AGENTS.md`](../../../AGENTS.md) §2.8 requires explicit approval for dependency changes — this skill defines the review checklist.

**Authority:** root [`AGENTS.md`](../../../AGENTS.md) §2.8 · [`out-of-scope.mdc`](../../rules/out-of-scope.mdc)

## Stop conditions

Stop and ask the user before proceeding if:

- The package replaces `@scure/*`, `@noble/*`, or `hash-wasm` without explicit approval
- The change is a major semver bump on a crypto or security-sensitive dependency
- The lockfile diff is unexpectedly large or touches unrelated packages
- Browser compatibility or bundle impact is unclear

## Review checklist

Answer each item before recommending install/upgrade:

| #   | Question                                    | Pass criteria                                                                                                                  |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Is a new dependency actually necessary?     | Existing deps, platform APIs, or in-repo code cannot reasonably provide it                                                     |
| 2   | Can the feature be done with current tools? | No duplicate capability already in monorepo                                                                                    |
| 3   | What is the package size?                   | Acceptable for a browser wallet; note `node_modules` + bundle impact                                                           |
| 4   | Is it browser-compatible?                   | No Node-only APIs (`fs`, `crypto` node module, `child_process`) unless isolated in worker with proof                           |
| 5   | Is maintenance healthy?                     | Recent releases, active repo, reasonable issue response — flag abandoned packages                                              |
| 6   | Does it support TypeScript?                 | Types included or reliable `@types/*`; no `any`-heavy API surface                                                              |
| 7   | Security / supply-chain risk?               | Check maintainer reputation, install scripts, postinstall hooks, typosquatting; prefer established crypto libs already in repo |
| 8   | Does it enter the main bundle?              | Trace import path; prefer devDependency if build/test only; flag heavy UI deps in `apps/web`                                   |
| 9   | Is there a lighter alternative?             | Smaller or already-shipped option (e.g. native API, existing `@hd-wallet/core` helper)                                         |
| 10  | Is the lockfile change reasonable?          | Diff limited to intended package + direct peers; no unrelated churn                                                            |

## HD Wallet constraints

- **No React/Zustand/DOM** in `@hd-wallet/core`
- **Crypto libs:** reuse `@scure/*`, `@noble/*`, `hash-wasm`, `viem`, `@solana/web3.js` unless user explicitly approves replacement
- **Do not run `pnpm install`** automatically — report findings and wait for approval
- **Do not modify lockfiles** without approved dependency operation

## Workflow

1. Restate the requested package and version (or range).
2. Walk the checklist; mark each item **pass / concern / fail**.
3. Check import site: which package (`apps/web`, `packages/core`, etc.) and runtime (main thread vs worker).
4. Estimate bundle impact if adding to `apps/web` dependencies (not devDependencies).
5. Recommend: **approve**, **approve with conditions**, or **reject with alternative**.

## Output template

```markdown
## Dependency review: <package>@<version>

| Check                     | Result            | Notes |
| ------------------------- | ----------------- | ----- |
| Necessary?                | pass/concern/fail | ...   |
| Current tools sufficient? | ...               | ...   |
| Size                      | ...               | ...   |
| Browser-compatible?       | ...               | ...   |
| Maintenance               | ...               | ...   |
| TypeScript                | ...               | ...   |
| Security / supply chain   | ...               | ...   |
| Main bundle               | ...               | ...   |
| Lighter alternative       | ...               | ...   |
| Lockfile scope            | ...               | ...   |

**Recommendation:** approve / reject / defer
**Suggested package.json target:** dependencies | devDependencies | none
**User approval required before install:** yes
```

## Persian summary (خلاصه)

هنگام نصب یا به‌روزرسانی پکیج بررسی کن:

1. آیا واقعاً dependency جدید لازم است؟
2. آیا با ابزار فعلی قابل انجام است؟
3. حجم پکیج چقدر است؟
4. آیا browser-compatible است؟
5. آیا maintenance مناسبی دارد؟
6. آیا TypeScript را پشتیبانی می‌کند؟
7. آیا ریسک امنیتی یا supply chain دارد؟
8. آیا وارد main bundle می‌شود؟
9. آیا جایگزین سبک‌تری وجود دارد؟
10. آیا lockfile به‌شکل منطقی تغییر کرده؟

فقط پس از تأیید کاربر `pnpm install` یا تغییر lockfile انجام شود.
