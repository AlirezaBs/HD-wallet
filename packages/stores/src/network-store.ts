import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NetworkMode } from "@hd-wallet/core";

type NetworkState = {
  evmNetworkMode: NetworkMode;
  solanaNetworkMode: NetworkMode;
  setEvmNetworkMode: (mode: NetworkMode) => void;
  setSolanaNetworkMode: (mode: NetworkMode) => void;
};

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set) => ({
      evmNetworkMode: "testnet",
      solanaNetworkMode: "testnet",
      setEvmNetworkMode: (mode) => set({ evmNetworkMode: mode }),
      setSolanaNetworkMode: (mode) => set({ solanaNetworkMode: mode }),
    }),
    { name: "hd-wallet-network" },
  ),
);
