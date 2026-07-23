import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SolanaBroadcastState } from "./types";

type SendSignedProps = {
  chainFamily: "evm" | "solana" | undefined;
  signedResult: string;
  submittedSignature: string | null;
  solanaBroadcastState: SolanaBroadcastState;
  loading: boolean;
  solanaBroadcastDisabled: boolean;
  solanaBroadcastLabel: string;
  error: string;
  onBroadcast: () => void;
  onNewTransfer: () => void;
};

export function SendSigned({
  chainFamily,
  signedResult,
  submittedSignature,
  solanaBroadcastState,
  loading,
  solanaBroadcastDisabled,
  solanaBroadcastLabel,
  error,
  onBroadcast,
  onNewTransfer,
}: SendSignedProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Transaction Signed</h2>
      <Card>
        <CardContent className="pt-4">
          {chainFamily === "solana" && !submittedSignature && !signedResult ? (
            <p className="text-sm text-muted-foreground">
              Transaction signed — ready to broadcast.
            </p>
          ) : (
            <p className="text-xs font-mono break-all">
              {submittedSignature ?? signedResult}
            </p>
          )}
          {chainFamily === "solana" && solanaBroadcastState === "confirmed" && (
            <p className="text-sm text-muted-foreground mt-2">
              Transaction confirmed on chain.
            </p>
          )}
          {chainFamily === "solana" && solanaBroadcastState === "failed" && (
            <p className="text-sm text-destructive mt-2">
              Broadcast failed. Review the error below or start a new transfer.
            </p>
          )}
        </CardContent>
      </Card>
      {(chainFamily === "evm" || chainFamily === "solana") && (
        <Button
          onClick={onBroadcast}
          disabled={chainFamily === "evm" ? loading : solanaBroadcastDisabled}
          className="w-full"
        >
          {chainFamily === "evm"
            ? loading
              ? "Broadcasting..."
              : "Broadcast Transaction"
            : solanaBroadcastLabel}
        </Button>
      )}
      <Button variant="outline" className="w-full" onClick={onNewTransfer}>
        New Transfer
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
