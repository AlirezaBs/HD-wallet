import { create } from "zustand";

type UiState = {
  isAccountSelectorOpen: boolean;
  isSignConfirmOpen: boolean;
  openAccountSelector: () => void;
  closeAccountSelector: () => void;
  openSignConfirm: () => void;
  closeSignConfirm: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isAccountSelectorOpen: false,
  isSignConfirmOpen: false,
  openAccountSelector: () => set({ isAccountSelectorOpen: true }),
  closeAccountSelector: () => set({ isAccountSelectorOpen: false }),
  openSignConfirm: () => set({ isSignConfirmOpen: true }),
  closeSignConfirm: () => set({ isSignConfirmOpen: false }),
}));
