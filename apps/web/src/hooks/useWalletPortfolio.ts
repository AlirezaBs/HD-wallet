import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTokenPrices } from "@/lib/tokens";
import { tokenQueryKeys } from "@/lib/queryKeys";
import { abortable, isAbortError, mergeAbortSignals } from "@/lib/abort";
import { useWalletAccounts } from "@/hooks/useWalletAccounts";
import {
  buildWalletTokenEntries,
  fetchPortfolioBalances,
} from "@/features/tokens/tokenBalances";
import { buildPortfolioSummary } from "@/features/tokens/tokenDisplay";

const QUERY_OPTIONS = {
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  refetchInterval: 5 * 60_000,
  refetchOnMount: true,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: (failureCount: number, error: unknown) =>
    !isAbortError(error) && failureCount < 1,
} as const;

export function useWalletPortfolio() {
  const queryClient = useQueryClient();
  const refreshAbortRef = useRef<AbortController | null>(null);
  const refreshGenerationRef = useRef(0);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { evmAccount, solanaAccount, evmMode, solanaMode, isReady } =
    useWalletAccounts();

  const entries = useMemo(
    () =>
      buildWalletTokenEntries(
        evmAccount?.address,
        solanaAccount?.address,
        evmMode,
        solanaMode,
      ),
    [evmAccount?.address, solanaAccount?.address, evmMode, solanaMode],
  );

  const entryKeys = entries.map((entry) => entry.balanceKey).join(",");
  const balancesQueryKey = tokenQueryKeys.portfolioBalances(
    evmAccount?.address,
    solanaAccount?.address,
    evmMode,
    solanaMode,
    entryKeys,
  );

  const coingeckoIds = useMemo(
    () => [
      ...new Set(
        entries
          .map((entry) => entry.token.coingeckoId)
          .filter((id): id is string => !!id),
      ),
    ],
    [entries],
  );

  const pricesQueryKey = tokenQueryKeys.prices(coingeckoIds);

  const balancesQuery = useQuery({
    queryKey: balancesQueryKey,
    queryFn: ({ signal }) => {
      const mergedSignal = mergeAbortSignals(
        signal,
        refreshAbortRef.current?.signal,
      );
      return abortable(
        mergedSignal,
        fetchPortfolioBalances(entries, mergedSignal),
      );
    },
    enabled: entries.length > 0,
    ...QUERY_OPTIONS,
  });

  const pricesQuery = useQuery({
    queryKey: pricesQueryKey,
    queryFn: ({ signal }) => {
      const mergedSignal = mergeAbortSignals(
        signal,
        refreshAbortRef.current?.signal,
      );
      return abortable(
        mergedSignal,
        fetchTokenPrices(coingeckoIds, mergedSignal),
      );
    },
    enabled: coingeckoIds.length > 0,
    ...QUERY_OPTIONS,
  });

  const refresh = useCallback(() => {
    refreshAbortRef.current?.abort();
    const generation = ++refreshGenerationRef.current;
    refreshAbortRef.current = new AbortController();
    setIsManualRefreshing(true);

    void Promise.all([
      balancesQuery.refetch({ cancelRefetch: true }),
      pricesQuery.refetch({ cancelRefetch: true }),
    ]).finally(() => {
      if (refreshGenerationRef.current !== generation) return;
      setIsManualRefreshing(false);
      refreshAbortRef.current = null;
    });
  }, [balancesQuery, pricesQuery]);

  const cancelRefresh = useCallback(() => {
    refreshGenerationRef.current += 1;
    refreshAbortRef.current?.abort();
    refreshAbortRef.current = null;
    setIsManualRefreshing(false);

    void Promise.all([
      queryClient.cancelQueries({ queryKey: balancesQueryKey }),
      queryClient.cancelQueries({ queryKey: pricesQueryKey }),
    ]);
  }, [queryClient, balancesQueryKey, pricesQueryKey]);

  const portfolio = useMemo(
    () =>
      buildPortfolioSummary(
        entries,
        balancesQuery.data?.balances,
        balancesQuery.data?.errors,
        pricesQuery.data,
        {
          balances: balancesQuery.isLoading,
          prices: pricesQuery.isLoading,
        },
      ),
    [
      entries,
      balancesQuery.data,
      balancesQuery.isLoading,
      pricesQuery.data,
      pricesQuery.isLoading,
    ],
  );

  return {
    isReady,
    entries,
    portfolio,
    balances: balancesQuery.data?.balances,
    balanceErrors: balancesQuery.data?.errors,
    prices: pricesQuery.data,
    balancesLoading: balancesQuery.isLoading,
    pricesLoading: pricesQuery.isLoading,
    balancesError: balancesQuery.isError,
    pricesError: pricesQuery.isError,
    refresh,
    cancelRefresh,
    isRefreshing: isManualRefreshing,
  };
}
