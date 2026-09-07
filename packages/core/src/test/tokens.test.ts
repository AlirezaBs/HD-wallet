import { describe, expect, it } from "vitest";

import { getNetworkTokens } from "../chains/tokens.js";

describe("network tokens", () => {
  it.each(["mainnet", "testnet"] as const)(
    "exposes only native SOL on Solana %s",
    (networkMode) => {
      expect(getNetworkTokens("solana", networkMode)).toEqual([
        expect.objectContaining({
          id: "native",
          name: "Solana",
          symbol: "SOL",
          isNative: true,
        }),
      ]);
    },
  );

  it("preserves the configured EVM tokens", () => {
    expect(
      getNetworkTokens("evm", "mainnet").map(({ symbol }) => symbol),
    ).toEqual(["ETH", "USDC", "USDT"]);
    expect(
      getNetworkTokens("evm", "testnet").map(({ symbol }) => symbol),
    ).toEqual(["ETH", "USDC"]);
  });
});
