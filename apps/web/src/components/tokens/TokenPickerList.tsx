import { TokenRow } from "@/components/TokenRow";
import { getNetworkBadge, getNetworkLabel } from "@/lib/network";
import type { TokenDisplayItem } from "@/features/tokens/types";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

type TokenHeaderProps = {
  item: TokenDisplayItem;
  size?: "sm" | "md" | "lg";
};

export function TokenHeader({ item, size = "md" }: TokenHeaderProps) {
  const [iconFailed, setIconFailed] = useState(false);
  const iconSize =
    size === "lg" ? "h-12 w-12" : size === "sm" ? "h-10 w-10" : "h-10 w-10";
  const badgeSize = size === "lg" ? "h-5 w-5 text-[9px]" : "h-4 w-4 text-[8px]";

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        {iconFailed ? (
          <div
            className={`flex ${iconSize} items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary`}
          >
            {item.entry.token.symbol.slice(0, 2)}
          </div>
        ) : (
          <img
            src={item.entry.token.iconUrl}
            alt={item.entry.token.name}
            className={`${iconSize} rounded-full bg-muted object-cover`}
            onError={() => setIconFailed(true)}
          />
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 flex ${badgeSize} items-center justify-center rounded-full border-2 border-background bg-primary font-bold text-primary-foreground`}
        >
          {getNetworkBadge(item.entry.chainFamily)}
        </span>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">
          {item.entry.token.symbol}
        </p>
        <p className={size === "lg" ? "text-lg font-semibold" : "font-medium"}>
          {item.entry.token.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {getNetworkLabel(item.entry.chainFamily, item.entry.networkMode)}
        </p>
      </div>
    </div>
  );
}

type TokenPickerListProps = {
  items: TokenDisplayItem[];
  onSelect: (item: TokenDisplayItem) => void;
  emptyMessage?: string;
  showChevron?: boolean;
};

export function TokenPickerList({
  items,
  onSelect,
  emptyMessage = "No tokens available.",
  showChevron = true,
}: TokenPickerListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card">
      {items.map((item) => (
        <button
          key={item.entry.balanceKey}
          type="button"
          onClick={() => onSelect(item)}
          className="flex w-full items-center text-left transition-colors hover:bg-accent/50 px-3"
        >
          <div className="min-w-0 flex-1">
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
          </div>
          {showChevron ? (
            <ChevronRight className="mr-1 h-4 w-4 shrink-0 text-muted-foreground" />
          ) : null}
        </button>
      ))}
    </div>
  );
}
