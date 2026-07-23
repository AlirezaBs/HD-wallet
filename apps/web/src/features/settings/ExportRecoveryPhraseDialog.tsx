import { useCallback, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { WrongPasswordError } from "@hd-wallet/core";
import { useSessionStore } from "@hd-wallet/stores";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { RecoveryPhraseGrid } from "@/components/RecoveryPhraseGrid";
import { useWorkerClient } from "@/hooks/useWorkerClient";
import { getErrorMessage } from "@/lib/errors";
import { copyWithClear } from "@/lib/utils";

type ExportRecoveryPhraseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function resetSensitiveState(
  setPassword: (value: string) => void,
  setMnemonic: (value: string | null) => void,
  setRevealed: (value: boolean) => void,
  setError: (value: string) => void,
  setCopied: (value: boolean) => void,
) {
  setPassword("");
  setMnemonic(null);
  setRevealed(false);
  setError("");
  setCopied(false);
}

export function ExportRecoveryPhraseDialog({
  open,
  onOpenChange,
}: ExportRecoveryPhraseDialogProps) {
  const [password, setPassword] = useState("");
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const worker = useWorkerClient();
  const isUnlocked = useSessionStore((s) => s.isUnlocked);

  const handleClose = useCallback(() => {
    resetSensitiveState(
      setPassword,
      setMnemonic,
      setRevealed,
      setError,
      setCopied,
    );
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (open && !isUnlocked) {
      handleClose();
    }
  }, [open, isUnlocked, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const phrase = await worker.exportRecoveryPhrase(password);
      setPassword("");
      setMnemonic(phrase);
      setRevealed(false);
    } catch (err) {
      if (
        err instanceof WrongPasswordError ||
        (err instanceof Error && err.message.includes("Wrong password"))
      ) {
        setError("Wrong password. Please try again.");
      } else {
        setError(getErrorMessage(err, "Failed to export recovery phrase"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!mnemonic) return;
    try {
      await copyWithClear(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy to clipboard.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export recovery phrase</DialogTitle>
        </DialogHeader>

        {!mnemonic ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your vault password to view your secret recovery phrase.
            </p>
            <div className="space-y-2">
              <Label htmlFor="export-password">Password</Label>
              <PasswordInput
                id="export-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || !password}
              >
                {loading ? "Verifying..." : "Continue"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="pt-4 flex gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Anyone with this phrase can access your wallet. Never share it
                  or store it online.
                </p>
              </CardContent>
            </Card>

            <RecoveryPhraseGrid
              mnemonic={mnemonic}
              revealed={revealed}
              onRevealChange={setRevealed}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopy}
                disabled={!revealed}
              >
                {copied ? "Copied" : "Copy phrase"}
              </Button>
              <Button className="flex-1" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
