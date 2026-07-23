import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useSettingsStore, useSessionStore } from "@hd-wallet/stores";
import { useWorkerClient } from "@/hooks/useWorkerClient";
import { lockWallet, resetWallet } from "@/lib/wallet-session";
import { useNavigate } from "react-router-dom";
import { openSignConfirmDialog } from "@/features/signing/SignConfirmDialog";
import { ExportRecoveryPhraseDialog } from "@/features/settings/ExportRecoveryPhraseDialog";

export function SettingsPage() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const autoLockMinutes = useSettingsStore((s) => s.autoLockMinutes);
  const setAutoLockMinutes = useSettingsStore((s) => s.setAutoLockMinutes);
  const activeChainFamily = useSessionStore((s) => s.activeChainFamily);
  const activeEvmIndex = useSessionStore((s) => s.activeEvmAccountIndex);
  const activeSolanaIndex = useSessionStore((s) => s.activeSolanaAccountIndex);
  const [message, setMessage] = useState("");
  const [signResult, setSignResult] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const worker = useWorkerClient();
  const navigate = useNavigate();

  const handleLock = () => {
    void lockWallet({ navigate });
  };

  const handleReset = async () => {
    if (!confirm("This will permanently delete your wallet. Continue?")) return;
    try {
      await resetWallet({ navigate });
    } catch {
      alert("Failed to reset wallet. Please try again.");
    }
  };

  const handleSignMessage = () => {
    openSignConfirmDialog({
      description:
        "Confirm you want to sign this message with your private key.",
      details: { message },
      onConfirm: async () => {
        if (activeChainFamily === "evm") {
          const sig = await worker.signEvmMessage({
            accountIndex: activeEvmIndex,
            message,
          });
          setSignResult(sig);
        } else {
          const sig = await worker.signSolanaMessage({
            accountIndex: activeSolanaIndex,
            message: new TextEncoder().encode(message),
          });
          setSignResult(sig);
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Settings</h2>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={theme}
              onChange={(e) =>
                setTheme(e.target.value as "light" | "dark" | "system")
              }
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Auto-lock (minutes)</Label>
            <Input
              type="number"
              min={1}
              max={60}
              value={autoLockMinutes}
              onChange={(e) => {
                const minutes = parseInt(e.target.value, 10);
                if (!Number.isNaN(minutes)) {
                  setAutoLockMinutes(Math.min(60, Math.max(1, minutes)));
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-3">
          <h3 className="text-sm font-medium">Sign Message</h3>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message to sign"
          />
          <Button
            variant="outline"
            className="w-full"
            disabled={!message}
            onClick={handleSignMessage}
          >
            Sign Message
          </Button>
          {signResult && (
            <p className="text-xs font-mono break-all bg-muted p-2 rounded">
              {signResult}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-3">
          <h3 className="text-sm font-medium">Security</h3>
          <p className="text-xs text-muted-foreground">
            Your recovery phrase grants full access to your wallet. Export it
            only in a private place and never share it.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setExportOpen(true)}
          >
            Export recovery phrase
          </Button>
        </CardContent>
      </Card>

      <ExportRecoveryPhraseDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
      />

      <Button variant="outline" className="w-full" onClick={handleLock}>
        Lock Wallet
      </Button>

      <Button variant="destructive" className="w-full" onClick={handleReset}>
        Reset Wallet
      </Button>
    </div>
  );
}
