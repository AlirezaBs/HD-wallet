import { getWorkerClient } from "@/hooks/useWorkerClient";
import { clearActivities, clearVault } from "@hd-wallet/core";
import { useSessionStore } from "@hd-wallet/stores";

export async function lockWallet(options?: {
  navigate?: (path: string) => void;
}): Promise<void> {
  await getWorkerClient().lockVault();
  useSessionStore.getState().setLocked();
  options?.navigate?.("/unlock");
}

export async function resetWallet(options?: {
  navigate?: (path: string, navigateOptions?: { replace?: boolean }) => void;
}): Promise<void> {
  await getWorkerClient().lockVault();
  await clearVault();
  await clearActivities();
  useSessionStore.getState().setLocked();
  options?.navigate?.("/onboarding", { replace: true });
}
