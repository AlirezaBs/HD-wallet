import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";
import { keccak_256 } from "@noble/hashes/sha3";
import { bytesToHex } from "@noble/hashes/utils";

export function evmDerivationPath(index: number): string {
  return `m/44'/60'/0'/0/${index}`;
}

export function deriveEvmAccount(
  mnemonic: string,
  index: number,
): { address: string; path: string; privateKey: Uint8Array } {
  const seed = mnemonicToSeedSync(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  const path = evmDerivationPath(index);
  const child = hdKey.derive(path);

  if (!child.privateKey) {
    throw new Error("Failed to derive EVM private key");
  }

  const publicKey = child.publicKey;
  if (!publicKey) {
    throw new Error("Failed to derive EVM public key");
  }
  const pubKeyWithoutPrefix = publicKey.slice(1);
  const hash = keccak_256(pubKeyWithoutPrefix);
  const address = `0x${bytesToHex(hash.slice(-20))}`;

  return {
    address,
    path,
    privateKey: child.privateKey,
  };
}

export function getEvmAddress(mnemonic: string, index: number): string {
  return deriveEvmAccount(mnemonic, index).address;
}
