import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useWorkerClient } from "@/hooks/useWorkerClient";
import { getErrorMessage } from "@/lib/errors";
import { hasVault, WrongPasswordError } from "@hd-wallet/core";
import { useSessionStore } from "@hd-wallet/stores";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30000;

export function UnlockPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const worker = useWorkerClient();
  const setUnlocked = useSessionStore((s) => s.setUnlocked);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    hasVault().then((vaultExists) => {
      if (!cancelled && !vaultExists) {
        navigate("/onboarding", { replace: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (!lockedUntil) return;
    const timer = setInterval(() => {
      if (Date.now() >= lockedUntil) {
        setLockedUntil(null);
        setAttempts(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setError("");
    setLoading(true);
    try {
      const state = await worker.unlockVault(password);
      setUnlocked(state);
      navigate("/wallet");
    } catch (err) {
      if (
        err instanceof WrongPasswordError ||
        (err instanceof Error && err.message.includes("Wrong password"))
      ) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_MS);
          setError(`Too many attempts. Try again in 30 seconds.`);
        } else {
          setError(
            `Wrong password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`,
          );
        }
      } else if (
        err instanceof Error &&
        err.message.includes("No vault found")
      ) {
        navigate("/onboarding", { replace: true });
      } else {
        setError(getErrorMessage(err, "Failed to unlock"));
      }
    } finally {
      setPassword("");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col border-x border-border shadow-lg p-6 justify-center">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary">HD Wallet</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your password to unlock
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isLocked}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || isLocked}
          >
            {loading ? "Unlocking..." : isLocked ? "Locked" : "Unlock"}
          </Button>
        </form>
      </div>
    </div>
  );
}
