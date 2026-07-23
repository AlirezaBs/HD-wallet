import { create } from "zustand";
import type { PublicWalletState, ChainFamily } from "@hd-wallet/core";

type SessionState = {
  isUnlocked: boolean;
  publicWalletState: PublicWalletState | null;
  activeEvmAccountIndex: number;
  activeSolanaAccountIndex: number;
  activeChainFamily: ChainFamily;
  setUnlocked: (state: PublicWalletState) => void;
  setLocked: () => void;
  setActiveEvmAccount: (index: number) => void;
  setActiveSolanaAccount: (index: number) => void;
  setActiveChainFamily: (family: ChainFamily) => void;
  updatePublicState: (state: PublicWalletState) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  isUnlocked: false,
  publicWalletState: null,
  activeEvmAccountIndex: 0,
  activeSolanaAccountIndex: 0,
  activeChainFamily: "evm",
  setUnlocked: (publicWalletState) =>
    set({ isUnlocked: true, publicWalletState }),
  setLocked: () => set({ isUnlocked: false, publicWalletState: null }),
  setActiveEvmAccount: (index) => set({ activeEvmAccountIndex: index }),
  setActiveSolanaAccount: (index) => set({ activeSolanaAccountIndex: index }),
  setActiveChainFamily: (family) => set({ activeChainFamily: family }),
  updatePublicState: (publicWalletState) => set({ publicWalletState }),
}));

export const FORBIDDEN_SESSION_KEYS = [
  "password",
  "mnemonic",
  "privateKey",
  "encryptionKey",
  "rawSeed",
  "decryptedVault",
] as const;
