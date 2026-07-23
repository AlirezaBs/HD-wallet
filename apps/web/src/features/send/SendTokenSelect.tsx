import { TokenPickerList } from "@/components/tokens/TokenPickerList";
import type { TokenDisplayItem } from "@/features/tokens/types";

type SendTokenSelectProps = {
  items: TokenDisplayItem[];
  error: string;
  onSelect: (item: TokenDisplayItem) => void;
};

export function SendTokenSelect({
  items,
  error,
  onSelect,
}: SendTokenSelectProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Send</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select a token to send
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <TokenPickerList
        items={items}
        onSelect={onSelect}
        emptyMessage="No sendable tokens on this network."
      />
    </div>
  );
}
