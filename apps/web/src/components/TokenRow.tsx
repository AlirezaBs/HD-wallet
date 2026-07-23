import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TokenDefinition } from "@hd-wallet/core";
import { formatFiat, formatTokenAmount } from "@/lib/tokens";

type TokenRowProps = {
  token: TokenDefinition;
  balance: string;
  fiatValue?: number;
  change24h?: number;
  networkBadge?: string;
  networkLabel?: string;
  balanceLoading?: boolean;
  priceLoading?: boolean;
  balanceError?: boolean;
};

export function TokenRow({
  token,
  balance,
  fiatValue,
  change24h,
  networkBadge,
  networkLabel,
  balanceLoading,
  priceLoading,
  balanceError,
}: TokenRowProps) {
  const [iconFailed, setIconFailed] = useState(false);
  const hasChange = change24h !== undefined;
  const isPositive = (change24h ?? 0) >= 0;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative shrink-0">
        {iconFailed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {token.symbol.slice(0, 2)}
          </div>
        ) : (
          <img
            src={token.iconUrl}
            alt={token.name}
            className="h-10 w-10 rounded-full bg-muted object-cover"
            onError={() => setIconFailed(true)}
          />
        )}
        {networkBadge ? (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-primary text-[8px] font-bold text-primary-foreground">
            {networkBadge}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{token.name}</p>
        {priceLoading ? (
          <div className="mt-1 h-4 w-16 animate-pulse rounded bg-muted" />
        ) : hasChange ? (
          <p
            className={cn(
              "text-sm",
              isPositive ? "text-emerald-500" : "text-red-500",
            )}
          >
            {isPositive ? "+" : ""}
            {change24h!.toFixed(2)}%
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {networkLabel ?? token.symbol}
          </p>
        )}
      </div>

      <div className="shrink-0 text-right">
        {balanceLoading ? (
          <>
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="ml-auto mt-1 h-4 w-14 animate-pulse rounded bg-muted" />
          </>
        ) : priceLoading ? (
          <>
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
            <p className="text-sm text-muted-foreground">
              {formatTokenAmount(balance)} {token.symbol}
            </p>
          </>
        ) : (
          <>
            <p className="font-medium">
              {balanceError
                ? "—"
                : fiatValue !== undefined
                  ? formatFiat(fiatValue)
                  : "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              {balanceError
                ? "Unavailable"
                : `${formatTokenAmount(balance)} ${token.symbol}`}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
