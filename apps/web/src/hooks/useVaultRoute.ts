import { useVaultAccess, type VaultAccessStatus } from "./useVaultAccess";

export type VaultRoute = VaultAccessStatus;

export function useVaultRoute(): VaultRoute {
  return useVaultAccess().status;
}
