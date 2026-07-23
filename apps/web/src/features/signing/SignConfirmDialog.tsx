import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@hd-wallet/stores";
import { useState } from "react";

type PendingSign = {
  title?: string;
  description: string;
  details?: Record<string, string>;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
};

let pendingSign: PendingSign | null = null;

export function openSignConfirmDialog(config: PendingSign) {
  pendingSign = config;
  useUiStore.getState().openSignConfirm();
}

export function SignConfirmDialog() {
  const isOpen = useUiStore((s) => s.isSignConfirmOpen);
  const close = useUiStore((s) => s.closeSignConfirm);
  const [loading, setLoading] = useState(false);

  const config = pendingSign;

  const handleConfirm = async () => {
    if (!config) return;
    setLoading(true);
    try {
      await config.onConfirm();
      pendingSign = null;
      close();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    pendingSign = null;
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config?.title ?? "Confirm Signature"}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{config?.description}</p>
        {config?.details && (
          <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
            {Object.entries(config.details).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-2">
                <span className="text-muted-foreground capitalize">{key}</span>
                <span className="font-mono text-xs break-all text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleConfirm} disabled={loading}>
            {loading ? "Signing..." : (config?.confirmLabel ?? "Sign")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
