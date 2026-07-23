import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { OnboardingGuard } from "@/components/OnboardingGuard";

export function OnboardingLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col border-x border-border shadow-lg p-6">
        <div className="mb-8 pt-4">
          <h1 className="text-2xl font-bold text-primary">HD Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your keys, your crypto
          </p>
        </div>
        <div className="flex-1">
          <OnboardingGuard>{children ?? <Outlet />}</OnboardingGuard>
        </div>
      </div>
    </div>
  );
}
