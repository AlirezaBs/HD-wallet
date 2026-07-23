#!/usr/bin/env node
import { existsSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const supportedExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".json",
  ".jsonc",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);

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

function walkStrings(value, strings = []) {
  if (typeof value === "string") {
    strings.push(value);
    return strings;
  }
  if (Array.isArray(value)) {
    for (const item of value) walkStrings(item, strings);
    return strings;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) walkStrings(item, strings);
  }
  return strings;
}

function normalizePath(value) {
  const fileUrlPrefix = "file://";
  const path = value.startsWith(fileUrlPrefix)
    ? new URL(value).pathname
    : value;
  const absolute = resolve(root, path);
  const relativePath = relative(root, absolute);
  if (relativePath.startsWith("..") || relativePath === "") return null;
  if (!existsSync(absolute) || !statSync(absolute).isFile()) return null;
  const dotIndex = absolute.lastIndexOf(".");
  const extension = dotIndex >= 0 ? absolute.slice(dotIndex) : "";
  if (!supportedExtensions.has(extension)) return null;
  return relativePath;
}

const input = await readInput();
const files = [
  ...new Set(walkStrings(input).map(normalizePath).filter(Boolean)),
];

if (files.length > 0) {
  const result = spawnSync(
    "pnpm",
    ["exec", "prettier", "--write", "--ignore-unknown", ...files],
    {
      cwd: root,
      encoding: "utf8",
    },
  );

  if (result.status !== 0) {
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.stdout) process.stderr.write(result.stdout);
    process.exit(result.status ?? 1);
  }
}

process.stdout.write("{}\n");
