import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkerClient } from "@/hooks/useWorkerClient";
import { getErrorMessage } from "@/lib/errors";
import {
  InvalidAccountLabelError,
  MAX_ACCOUNT_LABEL_CODE_POINTS,
} from "@hd-wallet/core";
import { useSessionStore, useUiStore } from "@hd-wallet/stores";
import { Plus, Trash2 } from "lucide-react";
import { AccountRow } from "./AccountRow";
import { AccountSelectorTrigger } from "./AccountSelectorTrigger";

export function AccountSelector() {
  const publicWalletState = useSessionStore((s) => s.publicWalletState);
  const activeEvmIndex = useSessionStore((s) => s.activeEvmAccountIndex);
  const activeSolanaIndex = useSessionStore((s) => s.activeSolanaAccountIndex);
  const setActiveEvm = useSessionStore((s) => s.setActiveEvmAccount);
  const setActiveSolana = useSessionStore((s) => s.setActiveSolanaAccount);
  const updatePublicState = useSessionStore((s) => s.updatePublicState);
  const isOpen = useUiStore((s) => s.isAccountSelectorOpen);
  const open = useUiStore((s) => s.openAccountSelector);
  const close = useUiStore((s) => s.closeAccountSelector);
  const worker = useWorkerClient();

  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const accountListRef = useRef<HTMLDivElement>(null);
  const scrollToEndAfterAddRef = useRef(false);

  useEffect(() => {
    if (renamingIndex === null) return;
    renameInputRef.current?.focus();
    renameInputRef.current?.select();
  }, [renamingIndex]);

  const accountCountPreview = publicWalletState
    ? Math.max(
        publicWalletState.evmAccounts.length,
        publicWalletState.solanaAccounts.length,
      )
    : 0;

  useEffect(() => {
    if (!scrollToEndAfterAddRef.current) return;
    const list = accountListRef.current;
    if (!list) return;
    scrollToEndAfterAddRef.current = false;
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [accountCountPreview, isOpen]);

  if (!publicWalletState) return null;

  const accountCount = Math.max(
    publicWalletState.evmAccounts.length,
    publicWalletState.solanaAccounts.length,
  );
  const activeIndex = Math.max(activeEvmIndex, activeSolanaIndex, 0);
  const evmAccount = publicWalletState.evmAccounts[activeIndex];
  const solanaAccount = publicWalletState.solanaAccounts[activeIndex];
  const displayName = evmAccount?.name ?? solanaAccount?.name ?? "Account";

  const resetRenameState = () => {
    setRenamingIndex(null);
    setDraftLabel("");
    setRenameError(null);
    setRenaming(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      open();
      return;
    }
    resetRenameState();
    close();
  };

  const handleAddAccount = async () => {
    setRemoveError(null);
    let state = await worker.addAccount("evm");
    state = await worker.addAccount("solana");
    scrollToEndAfterAddRef.current = true;
    updatePublicState(state);
  };

  const handleRemoveLastAccount = async () => {
    if (accountCount <= 1 || removing || renamingIndex !== null) return;
    setRemoving(true);
    setRemoveError(null);
    try {
      const state = await worker.removeLastAccount();
      const nextCount = Math.max(
        state.evmAccounts.length,
        state.solanaAccounts.length,
      );
      const nextActive = Math.max(0, nextCount - 1);
      if (activeEvmIndex >= nextCount) setActiveEvm(nextActive);
      if (activeSolanaIndex >= nextCount) setActiveSolana(nextActive);
      updatePublicState(state);
      resetRenameState();
    } catch (error) {
      setRemoveError(getErrorMessage(error, "Failed to remove account"));
    } finally {
      setRemoving(false);
    }
  };

  const selectAccount = (index: number) => {
    if (renamingIndex !== null) return;
    setActiveEvm(index);
    setActiveSolana(index);
    close();
  };

  const startRename = (index: number, currentName: string) => {
    setRenamingIndex(index);
    setDraftLabel(currentName);
    setRenameError(null);
  };

  const draftCodePoints = Array.from(draftLabel.trim()).length;
  const renamingCurrentName =
    renamingIndex === null
      ? ""
      : (publicWalletState.evmAccounts[renamingIndex]?.name ??
        publicWalletState.solanaAccounts[renamingIndex]?.name ??
        `Account ${renamingIndex + 1}`);
  const canSaveRename =
    renamingIndex !== null &&
    draftLabel.trim().length > 0 &&
    draftCodePoints <= MAX_ACCOUNT_LABEL_CODE_POINTS &&
    draftLabel.trim() !== renamingCurrentName &&
    !renaming;

  const handleSaveRename = async () => {
    if (renamingIndex === null || !canSaveRename) return;
    setRenaming(true);
    setRenameError(null);
    try {
      const state = await worker.renameAccount(renamingIndex, draftLabel);
      updatePublicState(state);
      resetRenameState();
    } catch (error) {
      const message =
        error instanceof InvalidAccountLabelError
          ? error.message
          : getErrorMessage(error, "Failed to rename account");
      setRenameError(message);
    } finally {
      setRenaming(false);
    }
  };

  return (
    <>
      <AccountSelectorTrigger
        displayName={displayName}
        evmAddress={evmAccount?.address}
        solanaAddress={solanaAccount?.address}
        onOpen={open}
      />

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Account</DialogTitle>
          </DialogHeader>
          <div
            ref={accountListRef}
            className="flex flex-col gap-2 max-h-96 overflow-y-auto"
          >
            {Array.from({ length: accountCount }, (_, index) => {
              const evm = publicWalletState.evmAccounts[index];
              const solana = publicWalletState.solanaAccounts[index];
              const name = evm?.name ?? solana?.name ?? `Account ${index + 1}`;

              return (
                <AccountRow
                  key={index}
                  index={index}
                  name={name}
                  evmAddress={evm?.address}
                  solanaAddress={solana?.address}
                  isActive={index === activeIndex}
                  isEditing={renamingIndex === index}
                  draftLabel={draftLabel}
                  renameError={renameError}
                  renaming={renaming}
                  canSaveRename={canSaveRename}
                  draftCodePoints={draftCodePoints}
                  renameInputRef={renameInputRef}
                  onSelect={() => selectAccount(index)}
                  onStartRename={() => startRename(index, name)}
                  onDraftChange={(value) => {
                    setDraftLabel(value);
                    setRenameError(null);
                  }}
                  onSaveRename={() => void handleSaveRename()}
                  onCancelRename={resetRenameState}
                />
              );
            })}
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => void handleAddAccount()}
              disabled={renamingIndex !== null || renaming || removing}
            >
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => void handleRemoveLastAccount()}
              disabled={
                accountCount <= 1 ||
                renamingIndex !== null ||
                renaming ||
                removing
              }
            >
              <Trash2 className="h-4 w-4" />
              {removing ? "Removing..." : "Remove last"}
            </Button>
          </div>
          {removeError ? (
            <p className="mt-2 text-sm text-destructive">{removeError}</p>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
