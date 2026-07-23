import { useEffect } from "react";
import { useSessionStore, useNetworkStore } from "@hd-wallet/stores";
import type { PublicAccount } from "@hd-wallet/core";

export function useWalletAccounts() {
  const publicWalletState = useSessionStore((s) => s.publicWalletState);
  const activeEvmIndex = useSessionStore((s) => s.activeEvmAccountIndex);
  const activeSolanaIndex = useSessionStore((s) => s.activeSolanaAccountIndex);
  const setActiveEvm = useSessionStore((s) => s.setActiveEvmAccount);
  const setActiveSolana = useSessionStore((s) => s.setActiveSolanaAccount);
  const evmMode = useNetworkStore((s) => s.evmNetworkMode);
  const solanaMode = useNetworkStore((s) => s.solanaNetworkMode);

  const evmAccounts = publicWalletState?.evmAccounts ?? [];
  const solanaAccounts = publicWalletState?.solanaAccounts ?? [];

  useEffect(() => {
    if (
      evmAccounts.length > 0 &&
      (activeEvmIndex < 0 || activeEvmIndex >= evmAccounts.length)
    ) {
      setActiveEvm(0);
    }
  }, [evmAccounts.length, activeEvmIndex, setActiveEvm]);

  useEffect(() => {
    if (
      solanaAccounts.length > 0 &&
      (activeSolanaIndex < 0 || activeSolanaIndex >= solanaAccounts.length)
    ) {
      setActiveSolana(0);
    }
  }, [solanaAccounts.length, activeSolanaIndex, setActiveSolana]);

  const safeEvmIndex =
    evmAccounts.length > 0
      ? Math.min(Math.max(activeEvmIndex, 0), evmAccounts.length - 1)
      : -1;
  const safeSolanaIndex =
    solanaAccounts.length > 0
      ? Math.min(Math.max(activeSolanaIndex, 0), solanaAccounts.length - 1)
      : -1;

  const evmAccount: PublicAccount | null =
    safeEvmIndex >= 0 ? (evmAccounts[safeEvmIndex] ?? null) : null;
  const solanaAccount: PublicAccount | null =
    safeSolanaIndex >= 0 ? (solanaAccounts[safeSolanaIndex] ?? null) : null;

  return {
    evmAccount,
    solanaAccount,
    evmMode,
    solanaMode,
    isReady: !!publicWalletState && (!!evmAccount || !!solanaAccount),
  };
}
