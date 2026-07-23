import { Navigate } from "react-router-dom";
import { useVaultRoute } from "@/hooks/useVaultRoute";

export function AppRouter() {
  const route = useVaultRoute();

  if (route === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (route === "onboarding") return <Navigate to="/onboarding" replace />;
  if (route === "unlock") return <Navigate to="/unlock" replace />;
  return <Navigate to="/wallet" replace />;
}
