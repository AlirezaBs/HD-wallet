import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { RecoveryPhraseGrid } from "@/components/RecoveryPhraseGrid";
import { hasVault } from "@hd-wallet/core";
import { useSessionStore } from "@hd-wallet/stores";

type BackupLocationState = {
  mnemonic: string;
};

function isBackupLocationState(value: unknown): value is BackupLocationState {
  return (
    typeof value === "object" &&
    value !== null &&
    "mnemonic" in value &&
    typeof (value as BackupLocationState).mnemonic === "string"
  );
}

export function BackupPage() {
  const location = useLocation();
  const [mnemonic, setMnemonic] = useState<string | null>(() => {
    if (isBackupLocationState(location.state)) {
      return location.state.mnemonic;
    }
    return null;
  });
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isBackupLocationState(location.state)) {
      navigate(".", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  const quizWords = useMemo(() => {
    if (!mnemonic) return [];
    const words = mnemonic.split(" ");
    const allIndices = words.map((_, i) => i);
    for (let i = allIndices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [allIndices[i], allIndices[j]] = [allIndices[j]!, allIndices[i]!];
    }
    const indices = allIndices.slice(0, Math.min(3, words.length));
    return indices.map((i) => ({ index: i + 1, word: words[i]! }));
  }, [mnemonic]);

  useEffect(() => {
    if (mnemonic) return;

    let cancelled = false;

    hasVault().then((vaultExists) => {
      if (cancelled) return;

      if (vaultExists) {
        const isUnlocked = useSessionStore.getState().isUnlocked;
        navigate(isUnlocked ? "/wallet" : "/unlock", { replace: true });
        return;
      }

      navigate("/onboarding/create", { replace: true });
    });

    return () => {
      cancelled = true;
    };
  }, [mnemonic, navigate]);

  const handleVerify = () => {
    setError("");
    const allCorrect = quizWords.every(
      (q) => answers[q.index]?.trim().toLowerCase() === q.word.toLowerCase(),
    );
    if (!allCorrect) {
      setError("Incorrect words. Please try again.");
      return;
    }
    setAnswers({});
    setMnemonic(null);
    navigate("/wallet", { replace: true });
  };

  if (!mnemonic) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Secret Recovery Phrase</h2>

      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="pt-4 flex gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Write down these words in order. Anyone with this phrase can access
            your wallet. Never share it.
          </p>
        </CardContent>
      </Card>

      <RecoveryPhraseGrid
        mnemonic={mnemonic}
        revealed={revealed}
        onRevealChange={setRevealed}
      />

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Confirm your backup</h3>
        {quizWords.map((q) => (
          <div key={q.index} className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Word #{q.index}
            </label>
            <input
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={answers[q.index] ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.index]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button className="w-full" onClick={handleVerify}>
        I&apos;ve saved my phrase
      </Button>
    </div>
  );
}
