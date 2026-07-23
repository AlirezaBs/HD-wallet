import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowDownLeft, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReceiveAddressCard } from "@/components/ReceiveAddressCard";
import { TokenHeader } from "@/components/tokens/TokenPickerList";
import { TokenPriceChart } from "@/components/TokenPriceChart";
import { useWalletPortfolioContext } from "@/features/tokens/WalletPortfolioProvider";
import { useTokenPriceHistory } from "@/hooks/useTokenPriceHistory";
import { useWalletAccounts } from "@/hooks/useWalletAccounts";
import { tokenQueryParams } from "@/lib/network";
import {
  formatFiat,
  formatPriceTimestamp,
  formatTokenAmount,
} from "@/lib/tokens";
import { cn } from "@/lib/utils";
import type { ChainFamily } from "@hd-wallet/core";

export function TokenDetailPage() {
  const { chainFamily: chainParam, tokenId } = useParams<{
    chainFamily: string;
    tokenId: string;
  }>();
  const chainFamily =
    chainParam === "evm" || chainParam === "solana" ? chainParam : null;

  const { evmAccount, solanaAccount, isReady } = useWalletAccounts();
  const { portfolio, balancesLoading, pricesLoading } =
    useWalletPortfolioContext();

  const displayItem = useMemo(
    () =>
      portfolio.displayItems.find(
        (item) =>
          item.entry.chainFamily === chainFamily &&
          item.entry.token.id === tokenId,
      ) ?? null,
    [portfolio.displayItems, chainFamily, tokenId],
  );

  const { data: history = [], isLoading: historyLoading } =
    useTokenPriceHistory(displayItem?.entry.token.coingeckoId, 1);

  if (!chainFamily || !tokenId || !displayItem) {
    return <Navigate to="/wallet" replace />;
  }

  const { entry, balance, price, fiatValue } = displayItem;
  const token = entry.token;
  const account =
    chainFamily === "evm"
      ? evmAccount
      : chainFamily === "solana"
        ? solanaAccount
        : null;

  if (!isReady || !account) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Unlock your wallet to view token details.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/unlock">Go to unlock</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isPositive = (price?.change24h ?? 0) >= 0;
  const latestHistoryPoint = history[history.length - 1];
  const displayPrice = price?.usd ?? latestHistoryPoint?.price;
  const updatedAt = price ? Date.now() : latestHistoryPoint?.timestamp;

  return (
    <div className="space-y-4">
      <Button variant="ghost" className="h-9 gap-1 px-0" asChild>
        <Link to="/wallet">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      <TokenHeader item={displayItem} size="lg" />

      <div>
        <p className="text-sm text-muted-foreground">Your balance</p>
        {balancesLoading &&
        balance === "0" &&
        displayItem.showBalanceSkeleton ? (
          <div className="mt-1 h-8 w-40 animate-pulse rounded bg-muted" />
        ) : (
          <>
            <p className="text-2xl font-bold">
              {formatTokenAmount(balance)} {token.symbol}
            </p>
            {fiatValue !== undefined ? (
              <p className="text-sm text-muted-foreground">
                {formatFiat(fiatValue)}
              </p>
            ) : null}
          </>
        )}
      </div>

      {token.coingeckoId ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Current price</p>
            {displayPrice !== undefined ? (
              <p className="text-3xl font-bold tracking-tight">
                {formatFiat(displayPrice)}
              </p>
            ) : pricesLoading ? (
              <div className="h-9 w-36 animate-pulse rounded bg-muted" />
            ) : (
              <p className="text-3xl font-bold tracking-tight">—</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              {price?.change24h !== undefined ? (
                <span
                  className={cn(
                    isPositive ? "text-emerald-500" : "text-red-500",
                  )}
                >
                  {isPositive ? "+" : ""}
                  {price.change24h.toFixed(2)}%
                </span>
              ) : null}
              {updatedAt ? (
                <span className="text-muted-foreground">
                  {formatPriceTimestamp(updatedAt)}
                </span>
              ) : null}
            </div>
          </div>

          {historyLoading && history.length === 0 ? (
            <div className="h-52 animate-pulse rounded-xl bg-muted/30" />
          ) : (
            <TokenPriceChart data={history} />
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Price chart is unavailable on testnet tokens.
          </CardContent>
        </Card>
      )}

      <div>
        <p className="mb-2 text-sm font-medium">Receive address</p>
        <ReceiveAddressCard
          address={account.address}
          chainFamily={chainFamily as ChainFamily}
          networkMode={entry.networkMode}
          compact
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to={`/wallet/send?${new URLSearchParams(tokenQueryParams(chainFamily as ChainFamily, token.id)).toString()}`}
        >
          <Button variant="outline" className="h-16 w-full flex-col gap-1">
            <Send className="h-5 w-5" />
            Send
          </Button>
        </Link>
        <Link
          to={`/wallet/receive?${new URLSearchParams(tokenQueryParams(chainFamily as ChainFamily, token.id)).toString()}`}
        >
          <Button variant="outline" className="h-16 w-full flex-col gap-1">
            <ArrowDownLeft className="h-5 w-5" />
            Receive
          </Button>
        </Link>
      </div>
    </div>
  );
}
