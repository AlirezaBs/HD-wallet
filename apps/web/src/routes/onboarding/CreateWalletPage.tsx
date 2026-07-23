import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useWorkerClient } from "@/hooks/useWorkerClient";
import { getErrorMessage } from "@/lib/errors";
import { validateWalletPassword } from "@/lib/password-validation";
import { useSessionStore } from "@hd-wallet/stores";

export function CreateWalletPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const worker = useWorkerClient();
  const navigate = useNavigate();
  const setUnlocked = useSessionStore((s) => s.setUnlocked);

  const strength =
    password.length >= 12 ? "strong" : password.length >= 8 ? "medium" : "weak";

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
      const { state, mnemonic } = await worker.createVault(password);
      navigate("/onboarding/backup", { state: { mnemonic }, replace: true });
      setUnlocked(state);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create wallet"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Create Password</h2>
      <p className="text-sm text-muted-foreground">
        This password encrypts your wallet locally. It cannot be recovered.
      </p>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        {password && (
          <div className="text-xs">
            Strength:{" "}
            <span
              className={
                strength === "strong"
                  ? "text-green-600"
                  : strength === "medium"
                    ? "text-yellow-600"
                    : "text-red-600"
              }
            >
              {strength}
            </span>
          </div>
        )}
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
        {loading ? "Creating..." : "Continue"}
      </Button>
    </form>
  );
}
