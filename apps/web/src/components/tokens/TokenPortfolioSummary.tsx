import { RefreshCw } from "lucide-react";
import { formatFiat } from "@/lib/tokens";

type TokenPortfolioSummaryProps = {
  totalFiat: number;
  hasPrices: boolean;
  balancesLoading: boolean;
  balancesLoaded: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onCancel: () => void;
  hasError?: boolean;
};

export function TokenPortfolioSummary({
  totalFiat,
  hasPrices,
  balancesLoading,
  balancesLoaded,
  isRefreshing,
  onRefresh,
  onCancel,
  hasError,
}: TokenPortfolioSummaryProps) {
  const handleClick = () => {
    if (isRefreshing) {
      onCancel();
      return;
    }
    onRefresh();
  };

  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-sm text-muted-foreground">Total balance</p>
        {balancesLoading && !balancesLoaded ? (
          <div className="mt-1 h-9 w-36 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-3xl font-bold tracking-tight">
            {hasPrices ? formatFiat(totalFiat) : "—"}
          </p>
        )}
        {hasError ? (
          <p className="mt-1 text-xs text-destructive">
            Some balances could not be loaded.
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={handleClick}
        aria-label={isRefreshing ? "Cancel refresh" : "Refresh balances"}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <RefreshCw
          className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
        />
        {isRefreshing ? "Cancel" : "Refresh"}
      </button>
    </div>
  );
}
