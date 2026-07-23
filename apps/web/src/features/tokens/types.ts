import type {
  ChainFamily,
  NetworkMode,
  TokenDefinition,
} from "@hd-wallet/core";
import type { TokenPrice } from "@/lib/tokens";

export type WalletTokenEntry = {
  chainFamily: ChainFamily;
  networkMode: NetworkMode;
  token: TokenDefinition;
  address: string;
  balanceKey: string;
};

export type TokenBalanceMap = Record<string, string>;
export type TokenBalanceErrorMap = Record<string, boolean>;

export type TokenDisplayItem = {
  entry: WalletTokenEntry;
  balance: string;
  price?: TokenPrice;
  fiatValue?: number;
  balanceError: boolean;
  showBalanceSkeleton: boolean;
  showPriceSkeleton: boolean;
};

export type PortfolioSummary = {
  totalFiat: number;
  hasPrices: boolean;
  displayItems: TokenDisplayItem[];
};
