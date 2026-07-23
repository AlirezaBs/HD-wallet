import { describe, it, expect } from "vitest";
import { mnemonicToSeedSync } from "@scure/bip39";
import { deriveEd25519Path } from "../wallet/slip10-ed25519.js";
import { getSolanaAddress } from "../wallet/derive-solana.js";

const TEST_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

describe("slip10-ed25519", () => {
  it("derives 32-byte ed25519 keys for Solana path", () => {
    const seed = mnemonicToSeedSync(TEST_MNEMONIC);
    const { key } = deriveEd25519Path("m/44'/501'/0'/0'", seed);
    expect(key.length).toBe(32);
  });

  it("produces stable Solana addresses (SLIP-0010 regression vectors)", () => {
    expect(getSolanaAddress(TEST_MNEMONIC, 0)).toBe(
      "HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk",
    );
    expect(getSolanaAddress(TEST_MNEMONIC, 1)).toBe(
      "Hh8QwFUA6MtVu1qAoq12ucvFHNwCcVTV7hpWjeY1Hztb",
    );
  });
});
