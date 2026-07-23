import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

type RecoveryPhraseGridProps = {
  mnemonic: string;
  revealed: boolean;
  onRevealChange?: (revealed: boolean) => void;
};

export function RecoveryPhraseGrid({
  mnemonic,
  revealed,
  onRevealChange,
}: RecoveryPhraseGridProps) {
  const words = mnemonic.split(" ");

  return (
    <div className="space-y-2">
      {onRevealChange && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRevealChange(!revealed)}
          >
            {revealed ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {revealed ? "Hide" : "Reveal"}
          </Button>
        </div>
      )}
      <div
        className={`grid grid-cols-3 gap-2 p-4 rounded-lg bg-muted font-mono text-sm ${
          !revealed ? "blur-md select-none" : ""
        }`}
      >
        {words.map((word, i) => (
          <div key={i} className="flex gap-1">
            <span className="text-muted-foreground text-xs">{i + 1}.</span>
            <span>{word}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
