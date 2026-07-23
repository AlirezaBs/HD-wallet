import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getVaultMetadata, type VaultMetadata } from "@hd-wallet/core";
import { useSessionStore } from "@hd-wallet/stores";

export type VaultAccessStatus = "loading" | "onboarding" | "unlock" | "wallet";

const EMPTY_METADATA: VaultMetadata = {
  hasVault: false,
  vaultVersion: 0,
  createdAt: "",
  updatedAt: "",
};

export function useVaultAccess(): {
  status: VaultAccessStatus;
  hasVault: boolean;
  isLoading: boolean;
} {
  const [metadata, setMetadata] = useState<VaultMetadata | null>(null);
  const location = useLocation();
  const isUnlocked = useSessionStore((s) => s.isUnlocked);
  const publicWalletState = useSessionStore((s) => s.publicWalletState);
  const setLocked = useSessionStore((s) => s.setLocked);

  useEffect(() => {
    let cancelled = false;

    getVaultMetadata()
      .then((meta) => {
        if (!cancelled) setMetadata(meta);
      })
      .catch(() => {
        if (!cancelled) setMetadata(EMPTY_METADATA);
      });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    if (isUnlocked && !publicWalletState) {
      setLocked();
    }
  }, [isUnlocked, publicWalletState, setLocked]);

  const isLoading = metadata === null;
  const hasVault = metadata?.hasVault ?? false;

  if (isLoading) {
    return { status: "loading", hasVault: false, isLoading: true };
  }
  if (!hasVault) {
    return { status: "onboarding", hasVault: false, isLoading: false };
  }
  if (!isUnlocked || !publicWalletState) {
    return { status: "unlock", hasVault: true, isLoading: false };
  }
  return { status: "wallet", hasVault: true, isLoading: false };
}
