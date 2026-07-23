import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReceiveAddressCard } from "@/components/ReceiveAddressCard";
import {
  TokenHeader,
  TokenPickerList,
} from "@/components/tokens/TokenPickerList";
import { useWalletPortfolioContext } from "@/features/tokens/WalletPortfolioProvider";
import { useWalletAccounts } from "@/hooks/useWalletAccounts";
import { tokenDetailPath } from "@/lib/network";
import {
  EVM_NETWORKS,
  SOLANA_NETWORKS,
  getFaucetUrl,
  type ChainFamily,
} from "@hd-wallet/core";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { TokenDisplayItem } from "@/features/tokens/types";

export function ReceivePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { evmAccount, solanaAccount, isReady } = useWalletAccounts();
  const { portfolio } = useWalletPortfolioContext();

  const chainParam = searchParams.get("chain");
  const tokenParam = searchParams.get("token");

  const selectedItem = useMemo(
    () =>
      portfolio.displayItems.find(
        (item) =>
          item.entry.chainFamily === chainParam &&
          item.entry.token.id === tokenParam,
      ) ?? null,
    [portfolio.displayItems, chainParam, tokenParam],
  );

  useEffect(() => {
    if (
      chainParam &&
      tokenParam &&
      !selectedItem &&
      portfolio.displayItems.length > 0
    ) {
      setSearchParams({}, { replace: true });
    }
  }, [
    chainParam,
    tokenParam,
    selectedItem,
    portfolio.displayItems.length,
    setSearchParams,
  ]);

  const receiveAccount =
    selectedItem?.entry.chainFamily === "evm"
      ? evmAccount
      : selectedItem?.entry.chainFamily === "solana"
        ? solanaAccount
        : null;

  const handleSelectItem = (item: TokenDisplayItem) => {
    setSearchParams({
      chain: item.entry.chainFamily,
      token: item.entry.token.id,
    });
  };

  const backLink = selectedItem
    ? tokenDetailPath(
        selectedItem.entry.chainFamily,
        selectedItem.entry.token.id,
      )
    : "/wallet";

  const faucetUrl =
    selectedItem != null
      ? getFaucetUrl(
          selectedItem.entry.chainFamily as ChainFamily,
          selectedItem.entry.networkMode,
        )
      : null;
  const faucetNetworkName =
    selectedItem?.entry.chainFamily === "evm"
      ? EVM_NETWORKS[selectedItem.entry.networkMode].name
      : selectedItem?.entry.chainFamily === "solana"
        ? SOLANA_NETWORKS[selectedItem.entry.networkMode].name
        : null;

  return (
    <div className="space-y-4">
      <Button variant="ghost" className="h-9 gap-1 px-0" asChild>
        <Link to={backLink}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      <h2 className="text-lg font-semibold">Receive</h2>

      {!isReady ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Unlock your wallet to view your receive address.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/unlock">Go to unlock</Link>
            </Button>
          </CardContent>
        </Card>
      ) : !selectedItem || !receiveAccount ? (
        <>
          <p className="text-sm text-muted-foreground">
            Select a token to see the receive address for its network.
          </p>
          <TokenPickerList
            items={portfolio.displayItems}
            onSelect={handleSelectItem}
            showChevron={false}
          />
        </>
      ) : (
        <>
          <Card>
            <CardContent className="pt-4">
              <TokenHeader item={selectedItem} />
            </CardContent>
          </Card>

          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="text-xs text-primary hover:underline"
          >
            Change token
          </button>

          <ReceiveAddressCard
            address={receiveAccount.address}
            chainFamily={selectedItem.entry.chainFamily as ChainFamily}
            networkMode={selectedItem.entry.networkMode}
          />

          {faucetUrl && faucetNetworkName ? (
            <Card>
              <CardContent className="space-y-2 pt-4">
                <p className="text-sm text-muted-foreground">
                  Need test {selectedItem.entry.token.symbol}? Open a
                  third-party {faucetNetworkName} faucet, paste your address
                  above, then refresh balances.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href={faucetUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open {faucetNetworkName} faucet
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
