import { type ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasVault } from "@hd-wallet/core";
import { useSessionStore } from "@hd-wallet/stores";

const ONBOARDING_SETUP_PATHS = new Set([
  "/onboarding",
  "/onboarding/create",
  "/onboarding/import",
]);

type OnboardingGuardProps = {
  children: ReactNode;
};

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const location = useLocation();
  const [vaultExists, setVaultExists] = useState<boolean | null>(null);
  const isUnlocked = useSessionStore((s) => s.isUnlocked);

  useEffect(() => {
    let cancelled = false;

    hasVault().then((exists) => {
      if (!cancelled) setVaultExists(exists);
    });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (vaultExists === null) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const blockSetup =
    vaultExists && ONBOARDING_SETUP_PATHS.has(location.pathname);

  if (blockSetup) {
    return <Navigate to={isUnlocked ? "/wallet" : "/unlock"} replace />;
  }

  return children;
}
