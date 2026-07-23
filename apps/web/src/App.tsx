import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "@/AppRouter";
import { WalletGuard } from "@/components/WalletGuard";
import { SignConfirmDialog } from "@/features/signing/SignConfirmDialog";
import { useAutoLock } from "@/hooks/useAutoLock";
import { OnboardingLayout } from "@/layouts/OnboardingLayout";
import { WalletShell } from "@/layouts/WalletShell";
import { WelcomePage } from "@/routes/onboarding/WelcomePage";
import { CreateWalletPage } from "@/routes/onboarding/CreateWalletPage";
import { ImportWalletPage } from "@/routes/onboarding/ImportWalletPage";
import { BackupPage } from "@/routes/onboarding/BackupPage";
import { UnlockPage } from "@/routes/unlock/UnlockPage";
import { HomePage } from "@/routes/wallet/HomePage";
import { SendPage } from "@/routes/wallet/SendPage";
import { ReceivePage } from "@/routes/wallet/ReceivePage";
import { ActivityPage } from "@/routes/wallet/ActivityPage";
import { SettingsPage } from "@/routes/wallet/SettingsPage";
import { TokenDetailPage } from "@/routes/wallet/TokenDetailPage";
import { ThemeProvider } from "@/theme/ThemeProvider";

function WalletShellWithAutoLock() {
  useAutoLock();
  return (
    <WalletGuard>
      <WalletShell />
    </WalletGuard>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppRouter />} />
            <Route path="/onboarding" element={<OnboardingLayout />}>
              <Route index element={<WelcomePage />} />
              <Route path="create" element={<CreateWalletPage />} />
              <Route path="import" element={<ImportWalletPage />} />
              <Route path="backup" element={<BackupPage />} />
            </Route>
            <Route path="/unlock" element={<UnlockPage />} />
            <Route path="/wallet" element={<WalletShellWithAutoLock />}>
              <Route index element={<HomePage />} />
              <Route
                path="token/:chainFamily/:tokenId"
                element={<TokenDetailPage />}
              />
              <Route path="send" element={<SendPage />} />
              <Route path="receive" element={<ReceivePage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <SignConfirmDialog />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
