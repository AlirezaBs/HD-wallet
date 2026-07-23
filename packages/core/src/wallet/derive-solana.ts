import { mnemonicToSeedSync } from "@scure/bip39";
import { getPublicKey } from "@noble/ed25519";
import { base58 } from "@scure/base";
import { ensureEd25519 } from "../crypto/ed25519-setup.js";
import { deriveEd25519Path } from "./slip10-ed25519.js";

export function solanaDerivationPath(index: number): string {
  return `m/44'/501'/${index}'/0'`;
}

export function deriveSolanaAccount(
  mnemonic: string,
  index: number,
): { address: string; path: string; privateKey: Uint8Array } {
  ensureEd25519();
  const seed = mnemonicToSeedSync(mnemonic);
  const path = solanaDerivationPath(index);
  const { key: privateKey } = deriveEd25519Path(path, seed);
  const publicKey = getPublicKey(privateKey);
  const address = base58.encode(publicKey);

  return {
    address,
    path,
    privateKey,
  };
}

export function getSolanaAddress(mnemonic: string, index: number): string {
  return deriveSolanaAccount(mnemonic, index).address;
}
