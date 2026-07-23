import { generateMnemonic, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { InvalidMnemonicError } from "../crypto/errors.js";

export function createMnemonic(wordCount: 12 | 24 = 12): string {
  const strength = wordCount === 24 ? 256 : 128;
  return generateMnemonic(wordlist, strength);
}

export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic.trim().toLowerCase(), wordlist);
}

export function normalizeMnemonic(mnemonic: string): string {
  const normalized = mnemonic.trim().toLowerCase().replace(/\s+/g, " ");
  if (!isValidMnemonic(normalized)) {
    throw new InvalidMnemonicError();
  }
  return normalized;
}
