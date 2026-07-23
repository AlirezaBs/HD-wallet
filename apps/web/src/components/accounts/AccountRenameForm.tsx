import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MAX_ACCOUNT_LABEL_CODE_POINTS } from "@hd-wallet/core";
import type { RefObject } from "react";

type AccountRenameFormProps = {
  draftLabel: string;
  renameError: string | null;
  renaming: boolean;
  canSaveRename: boolean;
  draftCodePoints: number;
  evmAddress?: string;
  solanaAddress?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function AccountRenameForm({
  draftLabel,
  renameError,
  renaming,
  canSaveRename,
  draftCodePoints,
  evmAddress,
  solanaAddress,
  inputRef,
  onDraftChange,
  onSave,
  onCancel,
}: AccountRenameFormProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Input
            ref={inputRef}
            value={draftLabel}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSave();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
              }
            }}
            aria-label="Account label"
            disabled={renaming}
            className="h-9 font-medium"
          />
          <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {draftCodePoints}/{MAX_ACCOUNT_LABEL_CODE_POINTS}
            </span>
            {draftCodePoints > MAX_ACCOUNT_LABEL_CODE_POINTS ? (
              <span className="text-destructive">Too long</span>
            ) : null}
          </div>
          {renameError ? (
            <p className="mt-1 text-sm text-destructive">{renameError}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg p-2 text-primary hover:bg-accent disabled:opacity-50"
          aria-label="Save account name"
          disabled={!canSaveRename}
          onClick={onSave}
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
          aria-label="Cancel rename"
          disabled={renaming}
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {evmAddress ? (
        <div className="text-xs text-muted-foreground truncate">
          EVM: {evmAddress}
        </div>
      ) : null}
      {solanaAddress ? (
        <div className="text-xs text-muted-foreground truncate">
          Solana: {solanaAddress}
        </div>
      ) : null}
    </div>
  );
}
