import type { NetworkMode } from "@hd-wallet/core";

export const tokenQueryKeys = {
  prices: (coingeckoIds: string[]) =>
    ["token-prices", coingeckoIds.join(",")] as const,
  priceHistory: (coingeckoId: string, days: number) =>
    ["token-price-history", coingeckoId, days] as const,
  portfolioBalances: (
    evmAddress: string | undefined,
    solanaAddress: string | undefined,
    evmMode: NetworkMode,
    solanaMode: NetworkMode,
    entryKeys: string,
  ) =>
    [
      "portfolio-balances",
      evmAddress,
      solanaAddress,
      evmMode,
      solanaMode,
      entryKeys,
    ] as const,
};
