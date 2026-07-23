import { Pencil } from "lucide-react";
import { AccountRenameForm } from "./AccountRenameForm";

type AccountRowProps = {
  index: number;
  name: string;
  evmAddress?: string;
  solanaAddress?: string;
  isActive: boolean;
  isEditing: boolean;
  draftLabel: string;
  renameError: string | null;
  renaming: boolean;
  canSaveRename: boolean;
  draftCodePoints: number;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  onSelect: () => void;
  onStartRename: () => void;
  onDraftChange: (value: string) => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
};

export function AccountRow({
  name,
  evmAddress,
  solanaAddress,
  isActive,
  isEditing,
  draftLabel,
  renameError,
  renaming,
  canSaveRename,
  draftCodePoints,
  renameInputRef,
  onSelect,
  onStartRename,
  onDraftChange,
  onSaveRename,
  onCancelRename,
}: AccountRowProps) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        isActive ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      {isEditing ? (
        <AccountRenameForm
          draftLabel={draftLabel}
          renameError={renameError}
          renaming={renaming}
          canSaveRename={canSaveRename}
          draftCodePoints={draftCodePoints}
          evmAddress={evmAddress}
          solanaAddress={solanaAddress}
          inputRef={renameInputRef}
          onDraftChange={onDraftChange}
          onSave={onSaveRename}
          onCancel={onCancelRename}
        />
      ) : (
        <div className="flex items-stretch gap-2">
          <button
            type="button"
            className="min-w-0 flex-1 text-left rounded-lg hover:bg-accent/50 -m-1 p-1"
            onClick={onSelect}
          >
            <div className="font-medium">{name}</div>
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
          </button>
          <button
            type="button"
            className="shrink-0 px-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
            aria-label={`Rename ${name}`}
            onClick={(event) => {
              event.stopPropagation();
              onStartRename();
            }}
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
