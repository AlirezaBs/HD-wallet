import { hmac } from "@noble/hashes/hmac";
import { sha512 } from "@noble/hashes/sha2";

const ED25519_CURVE = new TextEncoder().encode("ed25519 seed");
const HARDENED_OFFSET = 0x80000000;

type Slip10Node = { key: Uint8Array; chainCode: Uint8Array };

function getMasterKeyFromSeed(seed: Uint8Array): Slip10Node {
  const I = hmac(sha512, ED25519_CURVE, seed);
  return { key: I.slice(0, 32), chainCode: I.slice(32) };
}

function ckdPriv(parent: Slip10Node, index: number): Slip10Node {
  const indexBuffer = new Uint8Array(4);
  new DataView(indexBuffer.buffer).setUint32(0, index, false);
  const data = new Uint8Array(1 + parent.key.length + 4);
  data[0] = 0;
  data.set(parent.key, 1);
  data.set(indexBuffer, 1 + parent.key.length);
  const I = hmac(sha512, parent.chainCode, data);
  return { key: I.slice(0, 32), chainCode: I.slice(32) };
}

const PATH_REGEX = /^m(\/[0-9]+')+$/;

function parsePath(path: string): number[] {
  if (!PATH_REGEX.test(path)) {
    throw new Error("Invalid derivation path");
  }
  return path
    .split("/")
    .slice(1)
    .map((segment) => parseInt(segment.replace("'", ""), 10));
}

/** SLIP-0010 ed25519 hardened derivation (browser-safe, matches ed25519-hd-key). */
export function deriveEd25519Path(path: string, seed: Uint8Array): Slip10Node {
  let node = getMasterKeyFromSeed(seed);
  for (const segment of parsePath(path)) {
    node = ckdPriv(node, segment + HARDENED_OFFSET);
  }
  return node;
}
