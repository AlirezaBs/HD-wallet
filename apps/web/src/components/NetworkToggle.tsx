import { useNetworkStore } from "@hd-wallet/stores";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EVM_NETWORKS, SOLANA_NETWORKS, getFaucetUrl } from "@hd-wallet/core";

export function NetworkToggle() {
  const evmMode = useNetworkStore((s) => s.evmNetworkMode);
  const solanaMode = useNetworkStore((s) => s.solanaNetworkMode);
  const setEvmMode = useNetworkStore((s) => s.setEvmNetworkMode);
  const setSolanaMode = useNetworkStore((s) => s.setSolanaNetworkMode);

  const isMainnet = evmMode === "mainnet" && solanaMode === "mainnet";
  const evmFaucetUrl = getFaucetUrl("evm", evmMode);
  const solanaFaucetUrl = getFaucetUrl("solana", solanaMode);

  const handleToggle = (checked: boolean) => {
    const mode = checked ? "mainnet" : "testnet";
    setEvmMode(mode);
    setSolanaMode(mode);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label
            htmlFor="network-mode-toggle"
            className="text-xs text-muted-foreground"
          >
            Networks
          </Label>
          <div className="text-sm font-medium">
            {EVM_NETWORKS[evmMode].name} · {SOLANA_NETWORKS[solanaMode].name}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Testnet</span>
          <Switch
            id="network-mode-toggle"
            checked={isMainnet}
            onCheckedChange={handleToggle}
          />
          <span className="text-xs text-muted-foreground">Mainnet</span>
        </div>
      </div>

      {evmFaucetUrl || solanaFaucetUrl ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <span className="text-muted-foreground">Get test funds:</span>
          {evmFaucetUrl ? (
            <a
              href={evmFaucetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {EVM_NETWORKS[evmMode].name} faucet
            </a>
          ) : null}
          {solanaFaucetUrl ? (
            <a
              href={solanaFaucetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {SOLANA_NETWORKS[solanaMode].name} faucet
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
