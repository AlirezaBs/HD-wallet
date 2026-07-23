import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useVaultAccess } from "@/hooks/useVaultAccess";

type WalletGuardProps = {
  children: ReactNode;
};

export function WalletGuard({ children }: WalletGuardProps) {
  const { status, hasVault, isLoading } = useVaultAccess();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading wallet...
        </div>
      </div>
    );
  }

  if (!hasVault) {
    return <Navigate to="/onboarding" replace />;
  }

  if (status === "unlock") {
    return <Navigate to="/unlock" replace />;
  }

  return children;
}
