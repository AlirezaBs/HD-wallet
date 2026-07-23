import type { TokenPrices } from "@/lib/tokens";
import type {
  PortfolioSummary,
  TokenBalanceErrorMap,
  TokenBalanceMap,
  TokenDisplayItem,
  WalletTokenEntry,
} from "./types";

export function computeFiatValue(
  balance: string,
  priceUsd: number | undefined,
): number | undefined {
  if (priceUsd === undefined) return undefined;
  const parsed = parseFloat(balance);
  if (Number.isNaN(parsed)) return undefined;
  return parsed * priceUsd;
}

export function enrichTokenEntry(
  entry: WalletTokenEntry,
  balances: TokenBalanceMap | undefined,
  balanceErrors: TokenBalanceErrorMap | undefined,
  prices: TokenPrices | undefined,
  loading: { balances: boolean; prices: boolean },
): TokenDisplayItem {
  const balance = balances?.[entry.balanceKey] ?? "0";
  const price = entry.token.coingeckoId
    ? prices?.[entry.token.coingeckoId]
    : undefined;

  return {
    entry,
    balance,
    price,
    fiatValue: computeFiatValue(balance, price?.usd),
    balanceError: balanceErrors?.[entry.balanceKey] ?? false,
    showBalanceSkeleton: loading.balances && balances === undefined,
    showPriceSkeleton:
      loading.prices && prices === undefined && !!entry.token.coingeckoId,
  };
}

export function sortDisplayItems(
  items: TokenDisplayItem[],
): TokenDisplayItem[] {
  return [...items].sort((a, b) => {
    const aValue = a.fiatValue ?? 0;
    const bValue = b.fiatValue ?? 0;
    if (bValue !== aValue) return bValue - aValue;

    return a.entry.token.name.localeCompare(b.entry.token.name);
  });
}

export function buildPortfolioSummary(
  entries: WalletTokenEntry[],
  balances: TokenBalanceMap | undefined,
  balanceErrors: TokenBalanceErrorMap | undefined,
  prices: TokenPrices | undefined,
  loading: { balances: boolean; prices: boolean },
): PortfolioSummary {
  const displayItems = sortDisplayItems(
    entries.map((entry) =>
      enrichTokenEntry(entry, balances, balanceErrors, prices, loading),
    ),
  );

  const totalFiat = displayItems.reduce(
    (sum, item) => sum + (item.fiatValue ?? 0),
    0,
  );

  return {
    totalFiat,
    hasPrices: prices !== undefined,
    displayItems,
  };
}
