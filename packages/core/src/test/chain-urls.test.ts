import { describe, expect, it } from "vitest";
import { getExplorerAddressUrl, getExplorerTxUrl } from "../chains/types.js";

describe("EVM explorer URLs", () => {
  it("preserves mainnet address and transaction URLs", () => {
    expect(getExplorerAddressUrl("evm", "mainnet", "0xabc")).toBe(
      "https://etherscan.io/address/0xabc",
    );
    expect(getExplorerTxUrl("evm", "mainnet", "0xdef")).toBe(
      "https://etherscan.io/tx/0xdef",
    );
  });

  it("preserves testnet address and transaction URLs", () => {
    expect(getExplorerAddressUrl("evm", "testnet", "0xabc")).toBe(
      "https://sepolia.etherscan.io/address/0xabc",
    );
    expect(getExplorerTxUrl("evm", "testnet", "0xdef")).toBe(
      "https://sepolia.etherscan.io/tx/0xdef",
    );
  });
});

describe("Solana explorer URLs", () => {
  it("builds mainnet address and transaction URLs", () => {
    expect(getExplorerAddressUrl("solana", "mainnet", "address123")).toBe(
      "https://explorer.solana.com/address/address123",
    );
    expect(getExplorerTxUrl("solana", "mainnet", "signature123")).toBe(
      "https://explorer.solana.com/tx/signature123",
    );
  });

  it("keeps the Devnet cluster query after the address or transaction path", () => {
    expect(getExplorerAddressUrl("solana", "testnet", "address123")).toBe(
      "https://explorer.solana.com/address/address123?cluster=devnet",
    );
    expect(getExplorerTxUrl("solana", "testnet", "signature123")).toBe(
      "https://explorer.solana.com/tx/signature123?cluster=devnet",
    );
  });
});
