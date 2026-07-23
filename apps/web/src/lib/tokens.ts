export type TokenPrice = {
  usd: number;
  change24h: number;
};

export type TokenPrices = Record<string, TokenPrice>;

export async function fetchTokenPrices(
  coingeckoIds: string[],
  signal?: AbortSignal,
): Promise<TokenPrices> {
  if (coingeckoIds.length === 0) return {};

  const params = new URLSearchParams({
    ids: coingeckoIds.join(","),
    vs_currencies: "usd",
    include_24hr_change: "true",
  });

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch token prices");
  }

  const data = (await response.json()) as Record<
    string,
    { usd?: number; usd_24h_change?: number }
  >;

  return Object.fromEntries(
    Object.entries(data).map(([id, value]) => [
      id,
      {
        usd: value.usd ?? 0,
        change24h: value.usd_24h_change ?? 0,
      },
    ]),
  );
}

export function formatFiat(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatTokenAmount(value: string, maxDecimals = 4): string {
  const parsed = parseFloat(value);
  if (Number.isNaN(parsed)) return "0";
  if (parsed === 0) return "0";
  if (parsed < 0.0001) return parsed.toExponential(2);
  return parsed.toFixed(maxDecimals).replace(/\.?0+$/, "");
}

export type PriceHistoryPoint = {
  timestamp: number;
  price: number;
};

export async function fetchTokenPriceHistory(
  coingeckoId: string,
  days: 1 | 7 | 30 = 1,
  signal?: AbortSignal,
): Promise<PriceHistoryPoint[]> {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${days}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch price history");
  }

  const data = (await response.json()) as {
    prices?: [number, number][];
  };

  return (data.prices ?? []).map(([timestamp, price]) => ({
    timestamp,
    price,
  }));
}

export function formatPriceTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
