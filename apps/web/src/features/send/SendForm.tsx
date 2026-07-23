import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { TokenHeader } from "@/components/tokens/TokenPickerList";
import { formatTokenAmount } from "@/lib/tokens";
import type { TokenDisplayItem } from "@/features/tokens/types";

type SendFormProps = {
  selectedItem: TokenDisplayItem;
  chainFamily: "evm" | "solana";
  to: string;
  amount: string;
  error: string;
  onToChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onMaxAmount: () => void;
  onBack: () => void;
  onContinue: () => void;
};

export function SendForm({
  selectedItem,
  chainFamily,
  to,
  amount,
  error,
  onToChange,
  onAmountChange,
  onMaxAmount,
  onBack,
  onContinue,
}: SendFormProps) {
  const selectedToken = selectedItem.entry.token;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Select token
      </button>

      <Card>
        <CardContent className="pt-4">
          <TokenHeader item={selectedItem} />
          <p className="mt-3 text-sm text-muted-foreground">
            Available: {formatTokenAmount(selectedItem.balance)}{" "}
            {selectedToken.symbol}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <Label htmlFor="to">Recipient Address</Label>
        <Input
          id="to"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          placeholder={chainFamily === "evm" ? "0x..." : "Solana address"}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="amount">Amount ({selectedToken.symbol})</Label>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={onMaxAmount}
          >
            Max
          </button>
        </div>
        <Input
          id="amount"
          type="number"
          step="any"
          min="0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.0"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={onContinue} className="w-full">
        Continue
      </Button>
    </div>
  );
}
