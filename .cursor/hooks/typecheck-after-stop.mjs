#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const root = process.cwd();
const typecheckExtensions = /\.(ts|tsx|json)$/i;
const typecheckPaths =
  /^(apps\/web\/|packages\/(core|stores)\/|tsconfig|pnpm-workspace)/;

function readInput() {
  let raw = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    raw += chunk;
  });
  return new Promise((resolveInput) => {
    process.stdin.on("end", () => {
      if (!raw.trim()) {
        resolveInput({});
        return;
      }
      try {
        resolveInput(JSON.parse(raw));
      } catch {
        resolveInput({});
      }
    });
  });
}

function listChangedPaths() {
  const commands = [
    ["git", ["diff", "--name-only", "--diff-filter=ACMRTUXB", "HEAD"]],
    ["git", ["diff", "--name-only", "--cached", "--diff-filter=ACMRTUXB"]],
    ["git", ["ls-files", "--others", "--exclude-standard"]],
  ];

  const paths = new Set();
  for (const [cmd, args] of commands) {
    const result = spawnSync(cmd, args, { cwd: root, encoding: "utf8" });
    if (result.status !== 0) continue;
    for (const line of result.stdout.split("\n")) {
      const trimmed = line.trim();
      if (trimmed) paths.add(trimmed);
    }
  }
  return [...paths];
}

function shouldTypecheck(paths) {
  return paths.some(
    (path) => typecheckExtensions.test(path) && typecheckPaths.test(path),
  );
}

await readInput();
const changedPaths = listChangedPaths();

if (!shouldTypecheck(changedPaths)) {
  process.stdout.write("{}\n");
  process.exit(0);
}

const result = spawnSync("pnpm", ["typecheck"], {
  cwd: root,
  encoding: "utf8",
  timeout: 120_000,
});

if (result.status === 0) {
  process.stderr.write("[hooks] typecheck passed after task\n");
  process.stdout.write("{}\n");
  process.exit(0);
}

process.stderr.write("[hooks] typecheck failed after task\n");
if (result.stdout) process.stderr.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

const tail = (result.stderr || result.stdout || "pnpm typecheck failed")
  .split("\n")
  .slice(-12)
  .join("\n");

process.stdout.write(
  `${JSON.stringify({
    followup_message: `Typecheck failed after this task. Fix TypeScript errors before considering the task complete.\n\n${tail}`,
  })}\n`,
);
process.exit(result.status ?? 1);
