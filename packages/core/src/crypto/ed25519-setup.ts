import { sha512 } from "@noble/hashes/sha2";
import * as ed25519 from "@noble/ed25519";

let configured = false;

export function ensureEd25519(): void {
  if (configured) return;
  ed25519.etc.sha512Sync = (...m: Uint8Array[]) =>
    sha512(ed25519.etc.concatBytes(...m));
  configured = true;
}
