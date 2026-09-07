import { useCallback, useEffect, useRef, useState } from "react";
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

type ExportRecoveryPhraseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function resetSensitiveState(
  setPassword: (value: string) => void,
  setMnemonic: (value: string | null) => void,
  setRevealed: (value: boolean) => void,
  setError: (value: string) => void,
) {
  setPassword("");
  setMnemonic(null);
  setRevealed(false);
  setError("");
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
  const requestGenerationRef = useRef(0);
  const worker = useWorkerClient();
  const isUnlocked = useSessionStore((s) => s.isUnlocked);

  const handleClose = useCallback(() => {
    requestGenerationRef.current += 1;
    resetSensitiveState(setPassword, setMnemonic, setRevealed, setError);
    setLoading(false);
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(
    () => () => {
      requestGenerationRef.current += 1;
    },
    [],
  );

  useEffect(() => {
    if (open && !isUnlocked) {
      handleClose();
    }
  }, [open, isUnlocked, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const requestGeneration = requestGenerationRef.current + 1;
    requestGenerationRef.current = requestGeneration;
    const submittedPassword = password;
    setError("");
    setLoading(true);
    setPassword("");
    try {
      const phrase = await worker.exportRecoveryPhrase(submittedPassword);
      if (requestGenerationRef.current !== requestGeneration) return;
      setMnemonic(phrase);
      setRevealed(false);
    } catch (err) {
      if (requestGenerationRef.current !== requestGeneration) return;
      if (
        err instanceof WrongPasswordError ||
        (err instanceof Error && err.message.includes("Wrong password"))
      ) {
        setError("Wrong password. Please try again.");
      } else {
        setError(getErrorMessage(err, "Failed to export recovery phrase"));
      }
    } finally {
      if (requestGenerationRef.current === requestGeneration) {
        setLoading(false);
      }
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

            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
