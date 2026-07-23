import { useQuery } from "@tanstack/react-query";
import { fetchTokenPriceHistory } from "@/lib/tokens";
import { tokenQueryKeys } from "@/lib/queryKeys";
import { isAbortError } from "@/lib/abort";

export function useTokenPriceHistory(
  coingeckoId: string | undefined,
  days: 1 | 7 | 30 = 1,
) {
  return useQuery({
    queryKey: tokenQueryKeys.priceHistory(coingeckoId ?? "", days),
    queryFn: ({ signal }) => fetchTokenPriceHistory(coingeckoId!, days, signal),
    enabled: !!coingeckoId,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => !isAbortError(error) && failureCount < 1,
  });
}
