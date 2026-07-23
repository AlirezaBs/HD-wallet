import { ChevronDown } from "lucide-react";
import { truncateAddress } from "@/lib/utils";

type AccountSelectorTriggerProps = {
  displayName: string;
  evmAddress?: string;
  solanaAddress?: string;
  onOpen: () => void;
};

export function AccountSelectorTrigger({
  displayName,
  evmAddress,
  solanaAddress,
  onOpen,
}: AccountSelectorTriggerProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-2 text-sm font-medium hover:bg-accent rounded-lg px-2 py-1"
    >
      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
        {displayName.charAt(0)}
      </div>
      <div className="text-left">
        <div className="font-medium">{displayName}</div>
        <div className="text-xs text-muted-foreground">
          {evmAddress ? truncateAddress(evmAddress) : ""}
          {evmAddress && solanaAddress ? " · " : ""}
          {solanaAddress ? truncateAddress(solanaAddress) : ""}
        </div>
      </div>
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
