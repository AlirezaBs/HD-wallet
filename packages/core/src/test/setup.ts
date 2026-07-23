import "fake-indexeddb/auto";
import { sha512 } from "@noble/hashes/sha2";
import * as ed25519 from "@noble/ed25519";

ed25519.etc.sha512Sync = (...m: Uint8Array[]) =>
  sha512(ed25519.etc.concatBytes(...m));
