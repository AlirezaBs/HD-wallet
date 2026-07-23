import { Link } from "react-router-dom";
import { TokenPortfolioSummary } from "@/components/tokens/TokenPortfolioSummary";
import { TokenRow } from "@/components/TokenRow";
import { useWalletPortfolioContext } from "@/features/tokens/WalletPortfolioProvider";
import {
  tokenDetailPath,
  getNetworkBadge,
  getNetworkLabel,
} from "@/lib/network";

export function TokenList() {
  const {
    isReady,
    portfolio,
    balancesLoading,
    balances,
    balancesError,
    pricesError,
    refresh,
    cancelRefresh,
    isRefreshing,
  } = useWalletPortfolioContext();

  if (!isReady) {
    return (
      <p className="text-sm text-muted-foreground">
        Unlock your wallet to view tokens.
      </p>
    );
  }

  if (portfolio.displayItems.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tokens configured for this network.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <TokenPortfolioSummary
        totalFiat={portfolio.totalFiat}
        hasPrices={portfolio.hasPrices}
        balancesLoading={balancesLoading}
        balancesLoaded={balances !== undefined}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        onCancel={cancelRefresh}
        hasError={balancesError || pricesError}
      />

      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {portfolio.displayItems.map((item) => (
          <Link
            key={item.entry.balanceKey}
            to={tokenDetailPath(item.entry.chainFamily, item.entry.token.id)}
            className="block transition-colors hover:bg-accent/50 px-3"
          >
            <TokenRow
              token={item.entry.token}
              balance={item.balance}
              fiatValue={item.fiatValue}
              change24h={item.price?.change24h}
              networkBadge={getNetworkBadge(item.entry.chainFamily)}
              networkLabel={getNetworkLabel(
                item.entry.chainFamily,
                item.entry.networkMode,
              )}
              balanceLoading={item.showBalanceSkeleton}
              priceLoading={item.showPriceSkeleton}
              balanceError={item.balanceError}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
