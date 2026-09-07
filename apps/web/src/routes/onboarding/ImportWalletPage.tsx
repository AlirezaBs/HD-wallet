import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  hasVault,
  InvalidMnemonicError,
  VaultExistsError,
} from "@hd-wallet/core";
import { useWorkerClient } from "@/hooks/useWorkerClient";
import { getErrorMessage } from "@/lib/errors";
import { validateWalletPassword } from "@/lib/password-validation";
import { useSessionStore } from "@hd-wallet/stores";

export function ImportWalletPage() {
  const [mnemonic, setMnemonic] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const worker = useWorkerClient();
  const navigate = useNavigate();
  const setUnlocked = useSessionStore((s) => s.setUnlocked);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const passwordError = validateWalletPassword(password, confirm);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setLoading(true);
    try {
      if (await hasVault()) {
        setError("A wallet already exists. Unlock it or reset from Settings.");
        return;
      }
      const state = await worker.importVault(password, mnemonic.trim());
      setUnlocked(state);
      navigate("/wallet", { replace: true });
    } catch (err) {
      if (
        err instanceof InvalidMnemonicError ||
        (err instanceof Error && err.name === "InvalidMnemonicError")
      ) {
        setError("Invalid recovery phrase");
      } else if (
        err instanceof VaultExistsError ||
        (err instanceof Error && err.name === "VaultExistsError")
      ) {
        setError("A wallet already exists. Unlock it or reset from Settings.");
      } else {
        setError(getErrorMessage(err, "Failed to import wallet"));
      }
    } finally {
      setPassword("");
      setConfirm("");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Import Wallet</h2>
      <p className="text-sm text-muted-foreground">
        Enter your 12 or 24 word recovery phrase.
      </p>

      <div className="flex flex-col gap-2">
        <Label htmlFor="mnemonic">Recovery Phrase</Label>
        <textarea
          id="mnemonic"
          className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
          placeholder="word1 word2 word3 ..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">New Password</Label>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">Confirm Password</Label>
        <PasswordInput
          id="confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Importing..." : "Import Wallet"}
      </Button>
    </form>
  );
}
